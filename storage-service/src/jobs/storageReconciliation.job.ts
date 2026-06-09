import fs from 'fs';
import path from 'path';
import CargoImage from '../models/cargoImage.model';
import CompanyImage from '../models/companyImage.model';
import UserImage from '../models/userImages.model';
import { createStoredImageUpload } from '../utils/storedImageUpload';
import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import { logger } from '../config/logging';
import { enqueueImageEvent } from '../services/imageOutbox.service';

type ReconcileKind = {
  kind: 'user' | 'company' | 'cargo';
  uploadDirPath: string;
  fetchRows: () => Promise<Array<{ id?: number; fileName?: string | null }>>;
};

const reconcileKinds: ReconcileKind[] = [
  {
    kind: 'user',
    uploadDirPath: createStoredImageUpload(STORED_IMAGE_KINDS.user.uploadSubdir).uploadDirPath,
    fetchRows: async () => UserImage.findAll({ attributes: ['id', 'fileName'] }),
  },
  {
    kind: 'company',
    uploadDirPath: createStoredImageUpload(STORED_IMAGE_KINDS.company.uploadSubdir).uploadDirPath,
    fetchRows: async () => CompanyImage.findAll({ attributes: ['id', 'fileName'] }),
  },
  {
    kind: 'cargo',
    uploadDirPath: createStoredImageUpload(STORED_IMAGE_KINDS.cargo.uploadSubdir).uploadDirPath,
    fetchRows: async () => CargoImage.findAll({ attributes: ['id', 'fileName'] }),
  },
];

let reconcileHandle: NodeJS.Timeout | null = null;

function parseRetentionMs(): number {
  const hours = Number(process.env.ORPHAN_FILE_RETENTION_HOURS ?? '24');
  return (Number.isFinite(hours) && hours > 0 ? hours : 24) * 60 * 60 * 1000;
}

async function reconcileKind(kind: ReconcileKind): Promise<void> {
  const rows = await kind.fetchRows();
  const expectedFiles = new Set(rows.map((row) => row.fileName).filter((name): name is string => Boolean(name)));

  if (!fs.existsSync(kind.uploadDirPath)) return;
  const fileNames = fs.readdirSync(kind.uploadDirPath);
  const retentionMs = parseRetentionMs();

  for (const row of rows) {
    if (!row.fileName || !row.id) continue;
    const fullPath = path.join(kind.uploadDirPath, row.fileName);
    if (!fs.existsSync(fullPath)) {
      logger.warn('reconciliation: missing file for image row', { kind: kind.kind, imageId: row.id, fileName: row.fileName });
      await enqueueImageEvent({
        eventType: 'ImageReconciliationIssue',
        imageKind: kind.kind,
        imageId: row.id,
        payload: {
          issue: 'MISSING_FILE',
          fileName: row.fileName,
        },
      });
    }
  }

  for (const fileName of fileNames) {
    if (expectedFiles.has(fileName)) continue;
    const fullPath = path.join(kind.uploadDirPath, fileName);
    const stats = fs.statSync(fullPath);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < retentionMs) continue;

    try {
      fs.unlinkSync(fullPath);
      logger.warn('reconciliation: removed orphan file', { kind: kind.kind, fileName });
      await enqueueImageEvent({
        eventType: 'ImageReconciliationIssue',
        imageKind: kind.kind,
        payload: {
          issue: 'ORPHAN_FILE_REMOVED',
          fileName,
        },
      });
    } catch (error) {
      logger.warn('reconciliation: failed to remove orphan file', { kind: kind.kind, fileName, error });
    }
  }
}

async function runReconciliationCycle(): Promise<void> {
  for (const kind of reconcileKinds) {
    await reconcileKind(kind);
  }
}

export function startStorageReconciliationJob(): void {
  const intervalMs = Number(process.env.STORAGE_RECONCILIATION_INTERVAL_MS ?? '300000');
  const safeInterval = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : 300000;

  reconcileHandle = setInterval(() => {
    void runReconciliationCycle();
  }, safeInterval);
}

export function stopStorageReconciliationJob(): void {
  if (!reconcileHandle) return;
  clearInterval(reconcileHandle);
  reconcileHandle = null;
}
