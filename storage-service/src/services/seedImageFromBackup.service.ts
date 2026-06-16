import fs from 'fs';
import path from 'path';

import type { Model, ModelStatic } from 'sequelize';
import { getCatalogCargoImagesAssetsDir } from '@total-fretes/demo-seed-data';

import type { StoredImageUploadHelpers } from '../utils/storedImageUpload';
import { resolveUploadsRoot } from '../utils/storedImageUpload';

export type RegisterImageFromUploadsInput = {
	fileName: string;
	originalName: string;
	upload: StoredImageUploadHelpers;
	Model: ModelStatic<Model>;
	extraPayload?: Record<string, unknown>;
};

export type RegisteredImageResult = {
	id: number;
	originalName: string;
	fileName: string;
	created: boolean;
};

const SEED_FALLBACK_CARGO_IMAGE = 'seed-fallback.png';

/** PNG 1x1 válido usado quando `seed-fallback.png` não existe em disco. */
const MINIMAL_PNG_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function extractLogoSlug(logoFile: string): string {
	return logoFile
		.replace(/^\d+\s*-\s*/i, '')
		.replace(/\.png$/i, '')
		.replace(/-logo$/i, '')
		.toLowerCase();
}

function writeMinimalPng(filePath: string): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, Buffer.from(MINIMAL_PNG_BASE64, 'base64'));
}

/** Cria `seed-fallback.png` copiando outra imagem de carga ou gerando PNG mínimo. */
function ensureSeedFallbackCargoImage(destPath: string): string {
	const cargoDir = path.dirname(destPath);

	if (fs.existsSync(cargoDir)) {
		const donor = fs
			.readdirSync(cargoDir)
			.find(
				(entry) =>
					entry.toLowerCase().endsWith('.png') &&
					entry.toLowerCase() !== SEED_FALLBACK_CARGO_IMAGE.toLowerCase(),
			);

		if (donor) {
			fs.mkdirSync(cargoDir, { recursive: true });
			fs.copyFileSync(path.join(cargoDir, donor), destPath);
			return destPath;
		}
	}

	writeMinimalPng(destPath);
	return destPath;
}

/** Garante arquivo em `uploads/cargo-images/{fileName}` (copia de legado se necessário). */
function ensureCargoImageFileOnDisk(
	fileName: string,
	upload: StoredImageUploadHelpers,
): string | null {
	const destPath = upload.getStoredFullPath(fileName);
	if (fs.existsSync(destPath)) {
		return destPath;
	}

	const uploadsRoot = resolveUploadsRoot();
	const legacyDirs = [path.join(uploadsRoot, 'user-images', 'cargo-images')];

	for (const legacyDir of legacyDirs) {
		const legacyPath = path.join(legacyDir, fileName);
		if (!fs.existsSync(legacyPath)) continue;

		fs.mkdirSync(path.dirname(destPath), { recursive: true });
		fs.copyFileSync(legacyPath, destPath);
		return destPath;
	}

	const assetPath = path.join(getCatalogCargoImagesAssetsDir(), fileName);
	if (fs.existsSync(assetPath)) {
		fs.mkdirSync(path.dirname(destPath), { recursive: true });
		fs.copyFileSync(assetPath, destPath);
		return destPath;
	}

	if (fileName === SEED_FALLBACK_CARGO_IMAGE) {
		return ensureSeedFallbackCargoImage(destPath);
	}

	const fallbackPath = upload.getStoredFullPath(SEED_FALLBACK_CARGO_IMAGE);
	if (!fs.existsSync(fallbackPath)) {
		ensureSeedFallbackCargoImage(fallbackPath);
	}

	if (fs.existsSync(fallbackPath)) {
		fs.mkdirSync(path.dirname(destPath), { recursive: true });
		fs.copyFileSync(fallbackPath, destPath);
		return destPath;
	}

	return null;
}

/** Garante arquivo em `uploads/company-images/{logoFile}` (copia de legado se necessário). */
function ensureCompanyLogoFileOnDisk(
	logoFile: string,
	upload: StoredImageUploadHelpers,
): string | null {
	const destPath = upload.getStoredFullPath(logoFile);
	if (fs.existsSync(destPath)) {
		return destPath;
	}

	const uploadsRoot = resolveUploadsRoot();
	const slug = extractLogoSlug(logoFile);
	const legacyDirs = [path.join(uploadsRoot, 'user-images', 'company-images')];

	for (const legacyDir of legacyDirs) {
		if (!fs.existsSync(legacyDir)) continue;

		const match = fs
			.readdirSync(legacyDir)
			.find((entry) => entry.toLowerCase().includes(slug) && entry.toLowerCase().endsWith('.png'));

		if (!match) continue;

		fs.mkdirSync(path.dirname(destPath), { recursive: true });
		fs.copyFileSync(path.join(legacyDir, match), destPath);
		return destPath;
	}

	return null;
}

/** Registra imagem já presente em `/app/uploads/{subdir}` (bind mount da pasta local). */
export async function registerImageFromUploads(
	input: RegisterImageFromUploadsInput,
): Promise<RegisteredImageResult | null> {
	const { fileName, originalName, upload, Model, extraPayload = {} } = input;
	const companyId =
		typeof extraPayload.companyId === 'number' && extraPayload.companyId > 0
			? extraPayload.companyId
			: undefined;

	const destPath =
		companyId != null
			? ensureCompanyLogoFileOnDisk(fileName, upload)
			: ensureCargoImageFileOnDisk(fileName, upload);

	if (!destPath || !fs.existsSync(destPath)) {
		return null;
	}

	const stats = fs.statSync(destPath);
	const pathValue = upload.getStoredRelativePath(fileName);

	let existing = await Model.findOne({ where: { originalName } });
	if (!existing && companyId != null) {
		existing = await Model.findOne({ where: { companyId } });
	}

	if (existing) {
		const json = existing.toJSON() as { id?: number; fileName?: string; path?: string };
		const needsUpdate =
			json.fileName !== fileName ||
			json.path !== pathValue ||
			(companyId != null && (existing.toJSON() as { companyId?: number }).companyId !== companyId);

		if (needsUpdate) {
			await existing.update({
				originalName,
				fileName,
				path: pathValue,
				sizeBytes: stats.size,
				...(companyId != null ? { companyId } : {}),
			});
		}

		return {
			id: json.id!,
			originalName,
			fileName,
			created: false,
		};
	}

	const saved = await Model.create({
		originalName,
		fileName,
		path: pathValue,
		mimeType: 'image/png',
		sizeBytes: stats.size,
		...extraPayload,
	});

	const json = saved.toJSON() as { id?: number };
	return {
		id: json.id!,
		originalName,
		fileName,
		created: true,
	};
}

export async function listStoredImages(
	Model: ModelStatic<Model>,
): Promise<Array<{ id: number; originalName: string }>> {
	const rows = await Model.findAll({ attributes: ['id', 'originalName'] });
	return rows.map((row) => {
		const json = row.toJSON() as { id: number; originalName: string };
		return { id: json.id, originalName: json.originalName };
	});
}
