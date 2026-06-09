import { publishNotification, type NotificationPublishInput } from './notificationPublisher';

export const NotificationType = {
  PROPOSTA_AGUARDANDO_CONFIRMACAO: 'PROPOSTA_AGUARDANDO_CONFIRMACAO',
  PROPOSTA_NAO_SELECIONADA: 'PROPOSTA_NAO_SELECIONADA',
  PROPOSTA_RECUSADA: 'PROPOSTA_RECUSADA',
  PROPOSTA_ENVIADA: 'PROPOSTA_ENVIADA',
  PROPOSTA_ACEITA: 'PROPOSTA_ACEITA',
  FRETE_EM_TRANSITO: 'FRETE_EM_TRANSITO',
  FRETE_ENTREGUE: 'FRETE_ENTREGUE',
  FRETE_CANCELADO: 'FRETE_CANCELADO',
} as const;

type Metadata = {
  proposalId?: number;
  freightId?: number;
};

function send(userId: number, payload: Omit<NotificationPublishInput, 'userId'>) {
  if (!userId || Number.isNaN(userId)) return;
  publishNotification({ userId, ...payload });
}

/** App motorista — empresa aceitou e aguarda confirmação do caminhoneiro */
export function notifyDriverAwaitingConfirmation(
  driverId: number,
  metadata: Metadata,
) {
  send(driverId, {
    type: NotificationType.PROPOSTA_AGUARDANDO_CONFIRMACAO,
    title: 'Fretes em Espera',
    body: 'O frete foi aceito. Confirme para iniciar.',
    metadata,
  });
}

export function notifyDriverProposalNotSelected(driverId: number, metadata: Metadata) {
  send(driverId, {
    type: NotificationType.PROPOSTA_NAO_SELECIONADA,
    title: 'Proposta não selecionada',
    body: 'Outra proposta foi aceita para este frete',
    metadata,
  });
}

export function notifyDriverProposalRejected(driverId: number, metadata: Metadata) {
  send(driverId, {
    type: NotificationType.PROPOSTA_RECUSADA,
    title: 'Proposta recusada',
    body: 'Sua proposta foi recusada pela empresa',
    metadata,
  });
}

export function notifyDriverFreightCancelled(driverId: number, metadata: Metadata) {
  send(driverId, {
    type: NotificationType.FRETE_CANCELADO,
    title: 'Frete cancelado',
    body: 'O frete foi cancelado',
    metadata,
  });
}

/** Painel empresa */
export function notifyCompanyProposalSent(companyId: number, metadata: Metadata) {
  send(companyId, {
    type: NotificationType.PROPOSTA_ENVIADA,
    title: 'Nova proposta',
    body: 'Um motorista enviou proposta para seu frete',
    metadata,
  });
}

export function notifyCompanyProposalAccepted(companyId: number, metadata: Metadata) {
  send(companyId, {
    type: NotificationType.PROPOSTA_ACEITA,
    title: 'Proposta aceita',
    body: 'O motorista confirmou a proposta',
    metadata,
  });
}

export function notifyCompanyFreightInTransit(companyId: number, metadata: Metadata) {
  send(companyId, {
    type: NotificationType.FRETE_EM_TRANSITO,
    title: 'Frete em trânsito',
    body: 'O motorista iniciou o transporte',
    metadata,
  });
}

export function notifyCompanyFreightDelivered(companyId: number, metadata: Metadata) {
  send(companyId, {
    type: NotificationType.FRETE_ENTREGUE,
    title: 'Frete entregue',
    body: 'A entrega foi concluída pelo motorista',
    metadata,
  });
}

export function notifyCompanyFreightCancelled(companyId: number, metadata: Metadata) {
  send(companyId, {
    type: NotificationType.FRETE_CANCELADO,
    title: 'Frete cancelado',
    body: 'O frete foi cancelado',
    metadata,
  });
}

export async function notifyDriversFreightCancelled(
  freightId: number,
  assignedDriverId: number | null | undefined,
  driverIdsFromProposals: Array<number | null | undefined>,
) {
  const uniqueDrivers = new Set<number>();

  if (assignedDriverId != null) {
    uniqueDrivers.add(Number(assignedDriverId));
  }

  for (const driverId of driverIdsFromProposals) {
    if (driverId != null) {
      uniqueDrivers.add(Number(driverId));
    }
  }

  const metadata: Metadata = { freightId };

  for (const driverId of uniqueDrivers) {
    notifyDriverFreightCancelled(driverId, metadata);
  }
}
