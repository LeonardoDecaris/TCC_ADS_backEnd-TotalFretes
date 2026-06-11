import { generateCnpj } from '../utils/generateCnpj';

export type DemoCompanyAddress = {
	country: string;
	cep: string;
	street: string;
	district: string;
	number: string;
	city: string;
	state: string;
};

export type DemoCompanySpec = {
	slug: string;
	name: string;
	cnpj: string;
	/** Nome do arquivo em uploads/company-images/ */
	logoFile: string;
	phoneNumber: string;
	website: string;
	birthFundation: string;
	address: DemoCompanyAddress;
	/** Tipos de carga típicos para fretes desta empresa */
	preferredCargoNames: string[];
};

const address = (
	city: string,
	state: string,
	street: string,
	district: string,
	cep: string,
	number = '100',
): DemoCompanyAddress => ({
	country: 'BR',
	cep,
	street,
	district,
	number,
	city,
	state,
});

/** Evita colisão com CNPJ da empresa seed legada (00000000000191). */
const demoCnpj = (seq: number): string => generateCnpj(100 + seq);

export const DEMO_COMPANIES: DemoCompanySpec[] = [
	{
		slug: 'coamo',
		name: 'Coamo Cooperativa Agroindustrial',
		cnpj: demoCnpj(1),
		logoFile: '01 - coamo-logo.png',
		phoneNumber: '554432211000',
		website: 'https://www.coamo.com.br',
		birthFundation: '1970-03-15',
		address: address('Campo Mourão', 'PR', 'Av. Brasil', 'Centro', '87300000'),
		preferredCargoNames: ['Soja', 'Milho', 'Trigo', 'Grãos'],
	},
	{
		slug: 'cargill',
		name: 'Cargill Agrícola S.A.',
		cnpj: demoCnpj(2),
		logoFile: '02 - cargil-logo.png',
		phoneNumber: '551130045000',
		website: 'https://www.cargill.com.br',
		birthFundation: '1965-08-20',
		address: address('São Paulo', 'SP', 'Av. das Nações Unidas', 'Brooklin', '04578910'),
		preferredCargoNames: ['Soja', 'Milho', 'Farelo de Soja'],
	},
	{
		slug: 'copacol',
		name: 'Copacol Cooperativa Agroindustrial',
		cnpj: demoCnpj(3),
		logoFile: '03 - copacol-logo.png',
		phoneNumber: '554532345600',
		website: 'https://www.copacol.com.br',
		birthFundation: '1963-11-10',
		address: address('Cafelândia', 'PR', 'Rod. PR-482', 'Industrial', '85415000'),
		preferredCargoNames: ['Congelados', 'Carnes Frigorificadas'],
	},
	{
		slug: 'seara',
		name: 'Seara Alimentos Ltda',
		cnpj: demoCnpj(4),
		logoFile: '04 - seara-logo.png',
		phoneNumber: '554733456700',
		website: 'https://www.seara.com.br',
		birthFundation: '1959-05-01',
		address: address('Itajaí', 'SC', 'Rua Hercílio Luz', 'Centro', '88301001'),
		preferredCargoNames: ['Congelados', 'Carnes Frigorificadas', 'Sorvete'],
	},
	{
		slug: 'jbs',
		name: 'JBS S.A.',
		cnpj: demoCnpj(5),
		logoFile: '05 - jbs-logo.png',
		phoneNumber: '556233144400',
		website: 'https://www.jbs.com.br',
		birthFundation: '1953-12-12',
		address: address('Goiânia', 'GO', 'Av. T-4', 'Setor Bueno', '74230010'),
		preferredCargoNames: ['Congelados', 'Carnes Frigorificadas', 'Bovinos'],
	},
	{
		slug: 'frimesa',
		name: 'Frimesa Cooperativa Central',
		cnpj: demoCnpj(6),
		logoFile: '06 - frimesa-logo.png',
		phoneNumber: '554632241100',
		website: 'https://www.frimesa.com.br',
		birthFundation: '1960-07-22',
		address: address('Francisco Beltrão', 'PR', 'Av. Júlio Assis Cavalheiro', 'Centro', '85601000'),
		preferredCargoNames: ['Laticínios', 'Congelados'],
	},
	{
		slug: 'aurora',
		name: 'Aurora Alimentos',
		cnpj: demoCnpj(7),
		logoFile: '07 - aurora-logo.png',
		phoneNumber: '554932512000',
		website: 'https://www.auroraalimentos.com.br',
		birthFundation: '1969-04-18',
		address: address('Chapecó', 'SC', 'Av. Getúlio Vargas', 'Centro', '89802000'),
		preferredCargoNames: ['Laticínios', 'Alimentos Embalados', 'Congelados'],
	},
	{
		slug: 'votorantim',
		name: 'Votorantim Cimentos S.A.',
		cnpj: demoCnpj(8),
		logoFile: '08 - votorantin-cimentos-logo.png',
		phoneNumber: '551138889000',
		website: 'https://www.votorantimcimentos.com.br',
		birthFundation: '1933-01-30',
		address: address('São Paulo', 'SP', 'Av. Dr. Chucri Zaidan', 'Vila Cordeiro', '04583110'),
		preferredCargoNames: ['Cimento', 'Cal', 'Areia'],
	},
	{
		slug: 'lafarge',
		name: 'LafargeHolcim Brasil S.A.',
		cnpj: demoCnpj(9),
		logoFile: '09 - laforge-holcim-logo.png',
		phoneNumber: '551130345600',
		website: 'https://www.lafargeholcim.com.br',
		birthFundation: '1951-06-05',
		address: address('São Paulo', 'SP', 'Av. Pres. Juscelino Kubitschek', 'Vila Olímpia', '04543011'),
		preferredCargoNames: ['Cimento', 'Brita', 'Material de Construção'],
	},
	{
		slug: 'belocal',
		name: 'Belocal Materiais de Construção',
		cnpj: demoCnpj(10),
		logoFile: '10 - belocal-logo.png',
		phoneNumber: '554133224400',
		website: 'https://www.belocal.com.br',
		birthFundation: '1988-09-14',
		address: address('Curitiba', 'PR', 'Av. Sete de Setembro', 'Centro', '80060000'),
		preferredCargoNames: ['Material de Construção', 'Areia', 'Brita'],
	},
	{
		slug: 'duratex',
		name: 'Duratex S.A.',
		cnpj: demoCnpj(11),
		logoFile: '11 - duratex-logo.png',
		phoneNumber: '551130447700',
		website: 'https://www.dexco.com.br',
		birthFundation: '1951-03-08',
		address: address('São Paulo', 'SP', 'Av. Eng. Luís Carlos Berrini', 'Brooklin', '04571000'),
		preferredCargoNames: ['Madeira', 'Toras', 'Celulose'],
	},
	{
		slug: 'fertipar',
		name: 'Fertipar Fertilizantes',
		cnpj: demoCnpj(12),
		logoFile: '12 - fertipar-logo.png',
		phoneNumber: '554133556600',
		website: 'https://www.fertipar.com.br',
		birthFundation: '1975-02-28',
		address: address('Paranaguá', 'PR', 'Rod. BR-116', 'Porto', '83221000'),
		preferredCargoNames: ['Fertilizante granulado', 'Calcário', 'Químicos'],
	},
	{
		slug: 'klabin',
		name: 'Klabin S.A.',
		cnpj: demoCnpj(13),
		logoFile: '13 - klabin-logo.png',
		phoneNumber: '554234215500',
		website: 'https://www.klabin.com.br',
		birthFundation: '1899-08-28',
		address: address('Telêmaco Borba', 'PR', 'Av. Klabin', 'Centro', '84261000'),
		preferredCargoNames: ['Papel', 'Celulose', 'Madeira'],
	},
	{
		slug: 'yara',
		name: 'Yara Brasil Fertilizantes',
		cnpj: demoCnpj(14),
		logoFile: '14 - yara-logo.png',
		phoneNumber: '551330889900',
		website: 'https://www.yara.com.br',
		birthFundation: '1968-10-01',
		address: address('Cubatão', 'SP', 'Av. da Industria', 'Vila Light', '11573000'),
		preferredCargoNames: ['Fertilizante granulado', 'Químicos'],
	},
	{
		slug: 'raizen',
		name: 'Raízen Combustíveis S.A.',
		cnpj: demoCnpj(15),
		logoFile: '15 - raizen-logo.png',
		phoneNumber: '551130048800',
		website: 'https://www.raizen.com.br',
		birthFundation: '2011-06-30',
		address: address('São Paulo', 'SP', 'Av. Brigadeiro Faria Lima', 'Itaim Bibi', '04538132'),
		preferredCargoNames: ['Etanol Hidratado', 'Cana-de-açúcar', 'Diesel S10'],
	},
	{
		slug: 'shell',
		name: 'Shell Brasil Petróleo Ltda',
		cnpj: demoCnpj(16),
		logoFile: '16 - shell-logo.png',
		phoneNumber: '552130034000',
		website: 'https://www.shell.com.br',
		birthFundation: '1913-04-02',
		address: address('Rio de Janeiro', 'RJ', 'Av. República do Chile', 'Centro', '20031912'),
		preferredCargoNames: ['Diesel S10', 'Gasolina A', 'Etanol Hidratado'],
	},
	{
		slug: 'johndeere',
		name: 'John Deere Brasil Ltda',
		cnpj: demoCnpj(17),
		logoFile: '17 - johndeere-logo.png',
		phoneNumber: '551934337000',
		website: 'https://www.deere.com.br',
		birthFundation: '1979-11-20',
		address: address('Indaiatuba', 'SP', 'Rod. Heitor Penteado', 'Distrito Industrial', '13347000'),
		preferredCargoNames: ['Trator', 'Colheitadeira', 'Implementos Agrícolas'],
	},
	{
		slug: 'agco',
		name: 'AGCO do Brasil Comércio e Indústria',
		cnpj: demoCnpj(18),
		logoFile: '18 - agco-logo.png',
		phoneNumber: '555134048000',
		website: 'https://www.agcocorp.com.br',
		birthFundation: '1996-05-15',
		address: address('Canoas', 'RS', 'Av. João Corrêa', 'Industrial', '92041000'),
		preferredCargoNames: ['Trator Agrícola', 'Implementos Agrícolas', 'Máquinas Pesadas'],
	},
	{
		slug: 'tegma',
		name: 'Tegma Gestão Logística S.A.',
		cnpj: demoCnpj(19),
		logoFile: '19 - tegma-logo.png',
		phoneNumber: '554133312200',
		website: 'https://www.tegma.com.br',
		birthFundation: '1952-08-07',
		address: address('Curitiba', 'PR', 'Av. Iguaçu', 'Rebouças', '80250100'),
		preferredCargoNames: ['Veículos 0km', 'Automóveis', 'Utilitários'],
	},
	{
		slug: 'coteminas',
		name: 'Coteminas S.A.',
		cnpj: demoCnpj(20),
		logoFile: '20 - coteminas-logo.png',
		phoneNumber: '558132213300',
		website: 'https://www.coteminas.com.br',
		birthFundation: '1967-12-01',
		address: address('Santa Cruz do Capibaribe', 'PE', 'Av. Agamenon Magalhães', 'Centro', '55190000'),
		preferredCargoNames: ['Têxtil', 'Pallets', 'Carga Paletizada'],
	},
	{
		slug: 'ambev',
		name: 'Ambev S.A.',
		cnpj: demoCnpj(21),
		logoFile: '21 - ambev-logo.png',
		phoneNumber: '551130446000',
		website: 'https://www.ambev.com.br',
		birthFundation: '1999-07-01',
		address: address('São Paulo', 'SP', 'Rua Dr. Renato Paes de Barros', 'Itaim Bibi', '04530001'),
		preferredCargoNames: ['Bebidas', 'Pallets', 'Carga Paletizada'],
	},
	{
		slug: 'bunge',
		name: 'Bunge Alimentos S.A.',
		cnpj: demoCnpj(22),
		logoFile: '22 - bunge-logo.png',
		phoneNumber: '555133167000',
		website: 'https://www.bunge.com.br',
		birthFundation: '1905-05-10',
		address: address('Porto Alegre', 'RS', 'Av. Assis Brasil', 'São Sebastião', '91060900'),
		preferredCargoNames: ['Soja', 'Milho', 'Farelo de Soja', 'Trigo'],
	},
];

export function getDemoCompanyBySlug(slug: string): DemoCompanySpec | undefined {
	return DEMO_COMPANIES.find((company) => company.slug === slug);
}
