import fs from 'fs';
import path from 'path';

export type CatalogCargoImageSpec = {
	/** Nome do arquivo em uploads/cargo-images/ (mesmo valor em originalName e fileName no banco) */
	imageFile: string;
	/** Slug estável para referência interna */
	slug: string;
	/** Tipos de carga que usam esta imagem de reboque */
	cargoNames: string[];
};

/** @deprecated Use CatalogCargoImageSpec */
export type DemoCargoImageSpec = CatalogCargoImageSpec;

const cargoTypesFilePath = path.resolve(__dirname, 'data', 'cargoTypes.json');

const parseCargoTypes = (): CatalogCargoImageSpec[] => {
	const raw = fs.readFileSync(cargoTypesFilePath, 'utf8');
	return JSON.parse(raw) as CatalogCargoImageSpec[];
};

export const CATALOG_CARGO_IMAGES: CatalogCargoImageSpec[] = parseCargoTypes();

export const CATALOG_CARGO_TYPE_NAMES: string[] = CATALOG_CARGO_IMAGES.flatMap((spec) => spec.cargoNames);

/** @deprecated Use CATALOG_CARGO_IMAGES */
export const DEMO_CARGO_IMAGES: CatalogCargoImageSpec[] = CATALOG_CARGO_IMAGES;

/** @deprecated Use CATALOG_CARGO_TYPE_NAMES */
export const DEMO_CARGO_TYPE_NAMES: string[] = CATALOG_CARGO_TYPE_NAMES;

export function getCatalogCargoImagesAssetsDir(): string {
	return path.resolve(__dirname, '..', 'assets', 'cargo-images');
}

export function getCargoImageFileByCargoName(cargoName: string): string | undefined {
	for (const spec of CATALOG_CARGO_IMAGES) {
		if (spec.cargoNames.includes(cargoName)) {
			return spec.imageFile;
		}
	}
	return undefined;
}
