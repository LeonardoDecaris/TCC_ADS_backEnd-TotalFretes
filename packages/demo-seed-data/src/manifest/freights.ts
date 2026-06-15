import fs from 'fs';
import path from 'path';

export type DemoRoutePoint = {
	label: string;
	lat: number;
	lng: number;
};

export type DemoFreightProposalSpec = {
	driverIndex: number;
	value: number;
	status: 'Enviada' | 'Recusada' | 'Aceita' | 'Nao Selecionada';
};

export type DemoFreightKind = 'operational' | 'history';

export type DemoFreightSpec = {
	companySlug: string;
	seq: number;
	name: string;
	cargoName: string;
	origin: DemoRoutePoint;
	destination: DemoRoutePoint;
	freightStatus:
		| 'Disponivel'
		| 'Cancelado'
		| 'Vinculado'
		| 'Em Transito'
		| 'Em Rota de Entrega'
		| 'Entregue'
		| 'Concluido';
	originalValue: number;
	finalValue?: number | null;
	weight: number;
	daysLimit?: number;
	assignedDriverIndex?: number;
	historyPath: DemoFreightSpec['freightStatus'][];
	historyOccurredAt: string[];
	proposals: DemoFreightProposalSpec[];
	kind?: DemoFreightKind;
};
const freightsFilePath = path.resolve(__dirname, 'data', 'freights.json');

export function buildDemoFreights(): DemoFreightSpec[] {
	const raw = fs.readFileSync(freightsFilePath, 'utf8');
	return JSON.parse(raw) as DemoFreightSpec[];
}

export const DEMO_FREIGHTS: DemoFreightSpec[] = buildDemoFreights();
