export type DemoCargoImageSpec = {
	/** Nome do arquivo em uploads/cargo-images/ (mesmo valor em originalName e fileName no banco) */
	imageFile: string;
	/** Slug estável para referência interna */
	slug: string;
	/** Tipos de carga que usam esta imagem de reboque */
	cargoNames: string[];
};

export const DEMO_CARGO_IMAGES: DemoCargoImageSpec[] = [
	{
		imageFile: '02 - cacamba-image.png',
		slug: 'cacamba',
		cargoNames: ['Areia', 'Brita', 'Entulho', 'Minério', 'Material de Construção'],
	},
	{
		imageFile: '03 - graneleiro-image.png',
		slug: 'graneleiro',
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
		slug: 'bau',
		cargoNames: ['Papel', 'Eletrodomésticos', 'Alimentos Embalados', 'Têxtil'],
	},
	{
		imageFile: '05 - bau-refrigerado-image.png',
		slug: 'bau-refrigerado',
		cargoNames: ['Congelados', 'Carnes Frigorificadas', 'Laticínios', 'Sorvete'],
	},
	{
		imageFile: '06 - bau-sider-image.png',
		slug: 'bau-sider',
		cargoNames: ['Pallets', 'Carga Paletizada', 'Bebidas'],
	},
	{
		imageFile: '07 - graneleiro-bitrem-image.png',
		slug: 'graneleiro-bitrem',
		cargoNames: ['Farelo de Soja', 'Milho Ensacado', 'Sorgo', 'Aveia'],
	},
	{
		imageFile: '08 - reboque-prancha-image.png',
		slug: 'reboque-prancha',
		cargoNames: ['Trator', 'Escavadeira', 'Máquinas Pesadas', 'Equipamentos Industriais'],
	},
	{
		imageFile: '09 - caminhao-prancha-image.png',
		slug: 'caminhao-prancha',
		cargoNames: ['Trator Agrícola', 'Colheitadeira', 'Implementos Agrícolas'],
	},
	{
		imageFile: '10 - cegonha-image.png.png',
		slug: 'cegonha',
		cargoNames: ['Veículos 0km', 'Automóveis', 'Utilitários'],
	},
	{
		imageFile: '11 - bitrem-florestal-image.png',
		slug: 'bitrem-florestal',
		cargoNames: ['Madeira', 'Toras', 'Celulose'],
	},
	{
		imageFile: '12 - bitrem-canavieiro-image.png',
		slug: 'bitrem-canavieiro',
		cargoNames: ['Cana-de-açúcar'],
	},
	{
		imageFile: '13 - reboque-tanque-combustivel-image.png',
		slug: 'tanque-combustivel',
		cargoNames: ['Diesel S10', 'Etanol Hidratado', 'Gasolina A'],
	},
	{
		imageFile: '14 - reboque-tanque-liquidos-image.png',
		slug: 'tanque-liquidos',
		cargoNames: ['Leite', 'Óleo Vegetal', 'Químicos', 'Água Potável'],
	},
	{
		imageFile: '15 - reboque-container-image.png',
		slug: 'container',
		cargoNames: ['Container 20 pés', 'Container 40 pés', 'Container Reefer'],
	},
	{
		imageFile: '16 - reboque-boiadeiro-carga-viva-image.png',
		slug: 'boiadeiro',
		cargoNames: ['Bovinos', 'Suínos', 'Ovinos'],
	},
	{
		imageFile: '17 - reboque-piso-movel-image.png',
		slug: 'piso-movel',
		cargoNames: ['Carga a Granel Solta', 'Resíduos', 'Sucata'],
	},
	{
		imageFile: '18 - reboque-silo-image.png',
		slug: 'silo',
		cargoNames: ['Cimento', 'Cal', 'Farinha de Trigo', 'Amido'],
	},
	{
		/** Gerado automaticamente na seed se ausente (cópia de outra imagem ou PNG mínimo). */
		imageFile: 'seed-fallback.png',
		slug: 'outros',
		cargoNames: ['Outros'],
	},
];

export const DEMO_CARGO_TYPE_NAMES: string[] = DEMO_CARGO_IMAGES.flatMap((spec) => spec.cargoNames);

export function getCargoImageFileByCargoName(cargoName: string): string | undefined {
	for (const spec of DEMO_CARGO_IMAGES) {
		if (spec.cargoNames.includes(cargoName)) {
			return spec.imageFile;
		}
	}
	return undefined;
}
