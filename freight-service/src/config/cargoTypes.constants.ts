/**
 * Slugs estáveis para imagens de reboque usadas no catálogo de tipos de carga.
 * Referenciados em seedCargoTypes e no storage-service (demo-seed-data).
 */
export const CargoImageSlug = {
	CACAMBA: 'cacamba',
	GRANELEIRO: 'graneleiro',
	BAU: 'bau',
	BAU_REFRIGERADO: 'bau-refrigerado',
	BAU_SIDER: 'bau-sider',
	GRANELEIRO_BITREM: 'graneleiro-bitrem',
	REBOQUE_PRANCHA: 'reboque-prancha',
	CAMINHAO_PRANCHA: 'caminhao-prancha',
	CEGONHA: 'cegonha',
	BITREM_FLORESTAL: 'bitrem-florestal',
	BITREM_CANAVIEIRO: 'bitrem-canavieiro',
	TANQUE_COMBUSTIVEL: 'tanque-combustivel',
	TANQUE_LIQUIDOS: 'tanque-liquidos',
	CONTAINER: 'container',
	BOIADEIRO: 'boiadeiro',
	PISO_MOVEL: 'piso-movel',
	SILO: 'silo',
	OUTROS: 'outros',
} as const;

export type CatalogCargoImageSpec = {
	/** Nome do arquivo em uploads/cargo-images/ (mesmo valor em originalName e fileName no banco) */
	imageFile: string;
	/** Slug estável para referência interna */
	slug: string;
	/** Tipos de carga que usam esta imagem de reboque */
	cargoNames: readonly string[];
};

export const CATALOG_CARGO_IMAGES: readonly CatalogCargoImageSpec[] = [
	{
		imageFile: '02 - cacamba-image.png',
		slug: CargoImageSlug.CACAMBA,
		cargoNames: ['Areia', 'Brita', 'Entulho', 'Minério', 'Material de Construção'],
	},
	{
		imageFile: '03 - graneleiro-image.png',
		slug: CargoImageSlug.GRANELEIRO,
		cargoNames: [
			'Grãos',
			'Soja',
			'Milho',
			'Trigo',
			'Canos de PVC',
			'Tubos de aço',
			'Fertilizante granulado',
			'Calcário',
		],
	},
	{
		imageFile: '04 - bau-image.png',
		slug: CargoImageSlug.BAU,
		cargoNames: ['Papel', 'Eletrodomésticos', 'Alimentos Embalados', 'Têxtil'],
	},
	{
		imageFile: '05 - bau-refrigerado-image.png',
		slug: CargoImageSlug.BAU_REFRIGERADO,
		cargoNames: ['Congelados', 'Carnes Frigorificadas', 'Laticínios', 'Sorvete'],
	},
	{
		imageFile: '06 - bau-sider-image.png',
		slug: CargoImageSlug.BAU_SIDER,
		cargoNames: ['Pallets', 'Carga Paletizada', 'Bebidas'],
	},
	{
		imageFile: '07 - graneleiro-bitrem-image.png',
		slug: CargoImageSlug.GRANELEIRO_BITREM,
		cargoNames: ['Farelo de Soja', 'Milho Ensacado', 'Sorgo', 'Aveia'],
	},
	{
		imageFile: '08 - reboque-prancha-image.png',
		slug: CargoImageSlug.REBOQUE_PRANCHA,
		cargoNames: ['Trator', 'Escavadeira', 'Máquinas Pesadas', 'Equipamentos Industriais'],
	},
	{
		imageFile: '09 - caminhao-prancha-image.png',
		slug: CargoImageSlug.CAMINHAO_PRANCHA,
		cargoNames: ['Trator Agrícola', 'Colheitadeira', 'Implementos Agrícolas'],
	},
	{
		imageFile: '10 - cegonha-image.png.png',
		slug: CargoImageSlug.CEGONHA,
		cargoNames: ['Veículos 0km', 'Automóveis', 'Utilitários'],
	},
	{
		imageFile: '11 - bitrem-florestal-image.png',
		slug: CargoImageSlug.BITREM_FLORESTAL,
		cargoNames: ['Madeira', 'Toras', 'Celulose'],
	},
	{
		imageFile: '12 - bitrem-canavieiro-image.png',
		slug: CargoImageSlug.BITREM_CANAVIEIRO,
		cargoNames: ['Cana-de-açúcar'],
	},
	{
		imageFile: '13 - reboque-tanque-combustivel-image.png',
		slug: CargoImageSlug.TANQUE_COMBUSTIVEL,
		cargoNames: ['Diesel S10', 'Etanol Hidratado', 'Gasolina A'],
	},
	{
		imageFile: '14 - reboque-tanque-liquidos-image.png',
		slug: CargoImageSlug.TANQUE_LIQUIDOS,
		cargoNames: ['Leite', 'Óleo Vegetal', 'Químicos', 'Água Potável'],
	},
	{
		imageFile: '15 - reboque-container-image.png',
		slug: CargoImageSlug.CONTAINER,
		cargoNames: ['Container 20 pés', 'Container 40 pés', 'Container Reefer'],
	},
	{
		imageFile: '16 - reboque-boiadeiro-carga-viva-image.png',
		slug: CargoImageSlug.BOIADEIRO,
		cargoNames: ['Bovinos', 'Suínos', 'Ovinos'],
	},
	{
		imageFile: '17 - reboque-piso-movel-image.png',
		slug: CargoImageSlug.PISO_MOVEL,
		cargoNames: ['Carga a Granel Solta', 'Resíduos', 'Sucata'],
	},
	{
		imageFile: '18 - reboque-silo-image.png',
		slug: CargoImageSlug.SILO,
		cargoNames: ['Cimento', 'Cal', 'Farinha de Trigo', 'Amido'],
	},
	{
		imageFile: 'seed-fallback.png',
		slug: CargoImageSlug.OUTROS,
		cargoNames: ['Outros'],
	},
];

export const CATALOG_CARGO_TYPE_NAMES: readonly string[] = CATALOG_CARGO_IMAGES.flatMap(
	(spec) => spec.cargoNames,
);

export function getCargoImageFileByCargoName(cargoName: string): string | undefined {
	for (const spec of CATALOG_CARGO_IMAGES) {
		if (spec.cargoNames.includes(cargoName)) {
			return spec.imageFile;
		}
	}
	return undefined;
}
