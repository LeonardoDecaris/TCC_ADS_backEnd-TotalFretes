import type { Request } from 'express';
import { getCargoImageHttp, getCompanySummaryHttp, getUserSummaryHttp, type StorageImageData } from './service';

export type CompanySummary = {
  id: number;
  name: string;
  city?: string | null;
  phoneNumber?: string | null;
};

export type DriverSummary = {
  id: number;
  name: string;
  UserImage?: { url?: string | null } | null;
};

export type CargoImageSummary = {
  id: number;
  path?: string | null;
  url?: string | null;
  originalName?: string | null;
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
    phoneNumber: company.phoneNumber?.trim() || null,
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

function toPlainCargoType(cargoType: unknown): Record<string, unknown> {
  if (cargoType != null && typeof (cargoType as { toJSON?: () => unknown }).toJSON === 'function') {
    return (cargoType as { toJSON: () => Record<string, unknown> }).toJSON();
  }
  return { ...(cargoType as Record<string, unknown>) };
}

function toCargoImageSummary(image: StorageImageData | null): CargoImageSummary | null {
  if (!image?.id) return null;
  return {
    id: image.id,
    path: image.path ?? null,
    url: image.url ?? null,
    originalName: image.originalName ?? null,
  };
}

async function fetchCargoImageSummary(imageId: number): Promise<CargoImageSummary | null> {
  const image = await getCargoImageHttp({ id: imageId });
  return toCargoImageSummary(image);
}

async function buildCargoImageMap(imageIds: number[]): Promise<Map<number, CargoImageSummary>> {
  const imageMap = new Map<number, CargoImageSummary>();
  await Promise.all(
    imageIds.map(async (id) => {
      const summary = await fetchCargoImageSummary(id);
      if (summary) {
        imageMap.set(id, summary);
      }
    }),
  );
  return imageMap;
}

function resolveCargoImageId(cargoType: Record<string, unknown>): number | null {
  const imageId = Number(cargoType.imageCargo_id);
  return Number.isFinite(imageId) && imageId > 0 ? imageId : null;
}

function attachCargoImageToCargoType(
  cargoType: Record<string, unknown>,
  imageMap: Map<number, CargoImageSummary>,
): Record<string, unknown> {
  const imageId = resolveCargoImageId(cargoType);
  const CargoImage = imageId != null ? (imageMap.get(imageId) ?? null) : null;
  return { ...cargoType, CargoImage };
}

export async function enrichCargoTypeWithImage<T>(cargoType: T): Promise<Record<string, unknown>> {
  const plain = toPlainCargoType(cargoType);
  const imageId = resolveCargoImageId(plain);
  if (imageId == null) {
    return { ...plain, CargoImage: null };
  }

  const CargoImage = await fetchCargoImageSummary(imageId);
  return { ...plain, CargoImage };
}

export async function enrichCargoTypesWithImages<T>(
  cargoTypes: T[],
): Promise<Record<string, unknown>[]> {
  const plains = cargoTypes.map(toPlainCargoType);
  const imageIds = [
    ...new Set(
      plains
        .map((cargoType) => resolveCargoImageId(cargoType))
        .filter((id): id is number => id != null),
    ),
  ];

  const imageMap = await buildCargoImageMap(imageIds);
  return plains.map((cargoType) => attachCargoImageToCargoType(cargoType, imageMap));
}

function applyCargoImageToFreight(
  freight: Record<string, unknown>,
  enrichedCargo: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...freight, cargo: enrichedCargo, CargoType: enrichedCargo };
  return result;
}

async function enrichFreightCargoImage(freight: Record<string, unknown>): Promise<Record<string, unknown>> {
  const cargo = freight.cargo ?? freight.CargoType;
  if (cargo == null || typeof cargo !== 'object') {
    return freight;
  }

  const enrichedCargo = await enrichCargoTypeWithImage(cargo);
  return applyCargoImageToFreight(freight, enrichedCargo);
}

export async function enrichFreightsCargoImages(
  freights: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  const cargoTypes = freights
    .map((freight) => freight.cargo ?? freight.CargoType)
    .filter((cargo): cargo is Record<string, unknown> => cargo != null && typeof cargo === 'object');

  if (cargoTypes.length === 0) {
    return freights;
  }

  const enrichedCargoTypes = await enrichCargoTypesWithImages(cargoTypes);
  const enrichedById = new Map<number, Record<string, unknown>>();
  for (const cargoType of enrichedCargoTypes) {
    const id = Number(cargoType.id);
    if (Number.isFinite(id) && id > 0) {
      enrichedById.set(id, cargoType);
    }
  }

  return freights.map((freight) => {
    const cargo = freight.cargo ?? freight.CargoType;
    if (cargo == null || typeof cargo !== 'object') {
      return freight;
    }

    const cargoId = Number((cargo as Record<string, unknown>).id);
    const enrichedCargo = enrichedById.get(cargoId) ?? cargo;
    return applyCargoImageToFreight(freight, enrichedCargo as Record<string, unknown>);
  });
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

  let result = plain;
  if (Number.isFinite(companyId) && companyId > 0) {
    const company = await fetchCompanySummary(companyId, ctx);
    if (company) {
      result = { ...plain, Company: company };
    }
  }

  return enrichFreightCargoImage(result);
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

  const withCompany = freights.map((freight) => {
    const plain = toPlainFreight(freight);
    const companyId = Number(plain.company_id);
    const company = companyMap.get(companyId);
    return company ? { ...plain, Company: company } : plain;
  });

  return enrichFreightsCargoImages(withCompany);
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

function resolveProposalFreightKey(plain: Record<string, unknown>): 'Freight' | 'freight' | null {
  if (plain.Freight != null && typeof plain.Freight === 'object') return 'Freight';
  if (plain.freight != null && typeof plain.freight === 'object') return 'freight';
  return null;
}

export async function enrichProposalsFreightWithCompany<T>(
  proposals: T[],
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>[]> {
  const plains = proposals.map(toPlainProposal);
  const freights = plains
    .map((plain) => plain.Freight ?? plain.freight)
    .filter((freight): freight is Record<string, unknown> => freight != null && typeof freight === 'object');

  if (freights.length === 0) {
    return plains;
  }

  const enrichedFreights = await enrichFreightsWithCompany(freights, ctx);
  const enrichedById = new Map<number, Record<string, unknown>>();
  for (const freight of enrichedFreights) {
    const id = Number(freight.id);
    if (Number.isFinite(id) && id > 0) {
      enrichedById.set(id, freight);
    }
  }

  return plains.map((plain) => {
    const freightKey = resolveProposalFreightKey(plain);
    if (!freightKey) return plain;

    const freight = plain[freightKey] as Record<string, unknown>;
    const freightId = Number(freight.id);
    const enriched = enrichedById.get(freightId) ?? freight;
    return { ...plain, [freightKey]: enriched };
  });
}

export async function enrichProposalFreightWithCompany<T>(
  proposal: T,
  ctx: EnrichmentContext,
): Promise<Record<string, unknown>> {
  const [enriched] = await enrichProposalsFreightWithCompany([proposal], ctx);
  return enriched;
}

export { getEnrichmentContext };
