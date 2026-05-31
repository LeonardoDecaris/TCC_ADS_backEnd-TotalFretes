import type { Request } from 'express';
import { getCompanySummaryHttp, getUserSummaryHttp } from './service';

export type CompanySummary = {
  id: number;
  name: string;
  city?: string | null;
};

export type DriverSummary = {
  id: number;
  name: string;
  UserImage?: { url?: string | null } | null;
};

export type EnrichmentContext = {
  authorization?: string;
  locale?: string;
};

function getEnrichmentContext(req: Request): EnrichmentContext {
  return {
    authorization: req.headers.authorization?.trim(),
    locale: req.headers['accept-language']?.toString(),
  };
}

async function fetchCompanySummary(
  companyId: number,
  ctx: EnrichmentContext,
): Promise<CompanySummary | null> {
  const company = await getCompanySummaryHttp({ id: companyId, ...ctx });
  if (!company?.id) return null;

  return {
    id: company.id,
    name: company.name?.trim() || '',
    city: company.CompanyAddress?.city ?? null,
  };
}

async function fetchDriverSummary(
  driverId: number,
  ctx: EnrichmentContext,
): Promise<DriverSummary | null> {
  const user = await getUserSummaryHttp({ id: driverId, ...ctx });
  if (!user?.id) return null;

  const userImage = user.UserImage;
  const imageUrl = userImage?.url ?? null;

  return {
    id: user.id,
    name: user.name?.trim() || '',
    UserImage: imageUrl != null ? { url: imageUrl } : userImage ? { url: userImage.url ?? null } : null,
  };
}

function toPlainFreight(freight: unknown): Record<string, unknown> {
  if (freight != null && typeof (freight as { toJSON?: () => unknown }).toJSON === 'function') {
    return (freight as { toJSON: () => Record<string, unknown> }).toJSON();
  }
  return { ...(freight as Record<string, unknown>) };
}

function toPlainProposal(proposal: unknown): Record<string, unknown> {
  if (proposal != null && typeof (proposal as { toJSON?: () => unknown }).toJSON === 'function') {
    return (proposal as { toJSON: () => Record<string, unknown> }).toJSON();
  }
  return { ...(proposal as Record<string, unknown>) };
}

export async function enrichFreightWithCompany<T>(
  freight: T,
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>> {
  const plain = toPlainFreight(freight);
  const companyId = Number(plain.company_id);

  if (!Number.isFinite(companyId) || companyId <= 0) {
    return plain;
  }

  const company = await fetchCompanySummary(companyId, ctx);
  if (!company) {
    return plain;
  }

  return { ...plain, Company: company };
}

export async function enrichFreightsWithCompany<T>(
  freights: T[],
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>[]> {
  const companyIds = [
    ...new Set(
      freights
        .map((f) => Number(toPlainFreight(f).company_id))
        .filter((id) => Number.isFinite(id) && id > 0),
    ),
  ];

  const companyMap = new Map<number, CompanySummary>();
  await Promise.all(
    companyIds.map(async (id) => {
      const summary = await fetchCompanySummary(id, ctx);
      if (summary) {
        companyMap.set(id, summary);
      }
    }),
  );

  return freights.map((freight) => {
    const plain = toPlainFreight(freight);
    const companyId = Number(plain.company_id);
    const company = companyMap.get(companyId);
    return company ? { ...plain, Company: company } : plain;
  });
}

export async function enrichProposalWithDriver<T>(
  proposal: T,
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>> {
  const plain = toPlainProposal(proposal);
  const driverId = Number(plain.driver_id);

  if (!Number.isFinite(driverId) || driverId <= 0) {
    return plain;
  }

  const driver = await fetchDriverSummary(driverId, ctx);
  if (!driver) {
    return plain;
  }

  return { ...plain, Driver: driver };
}

export async function enrichProposalsWithDriver<T>(
  proposals: T[],
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>[]> {
  const driverIds = [
    ...new Set(
      proposals
        .map((p) => Number(toPlainProposal(p).driver_id))
        .filter((id) => Number.isFinite(id) && id > 0),
    ),
  ];

  const driverMap = new Map<number, DriverSummary>();
  await Promise.all(
    driverIds.map(async (id) => {
      const summary = await fetchDriverSummary(id, ctx);
      if (summary) {
        driverMap.set(id, summary);
      }
    }),
  );

  return proposals.map((proposal) => {
    const plain = toPlainProposal(proposal);
    const driverId = Number(plain.driver_id);
    const driver = driverMap.get(driverId);
    return driver ? { ...plain, Driver: driver } : plain;
  });
}

export { getEnrichmentContext };
