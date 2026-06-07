import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import sequelize from '../config/database';
import {
  ACCEPTED_PROPOSAL_STATUS_NAMES,
  FreightStatusSlug,
  ProposalStatusSlug,
} from '../config/statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import type {
  acceptProposalSchema,
  createProposalSchema,
  proposalFreightSummaryQuerySchema,
  proposalListQuerySchema,
  rejectProposalSchema,
  updateProposalSchema,
} from '../schemas/proposals.schemas';
import type { z } from 'zod';
import { recordFreightStatusHistory } from './freightStatusHistory.service';
import { fetchProposalFreightSummary } from './proposalsFreightSummary.service';
import {
  fetchProposalListSummary,
  mapProposalStatusFilterToDomainNames,
} from './proposalsList.service';
import {
  notifyCompanyProposalAccepted,
  notifyCompanyProposalSent,
  notifyDriverAwaitingConfirmation,
  notifyDriverProposalNotSelected,
  notifyDriverProposalRejected,
} from '../messaging/notificationEvents';

export const getFreightNestedInclude = () => [
  { model: CargoType, as: 'cargo', required: false },
  { model: FreightStatusType, as: 'status', required: false },
];

export const getProposalInclude = (statusNames?: string[], withFreightDetails = false) => [
  {
    model: Freight,
    required: false,
    ...(withFreightDetails ? { include: getFreightNestedInclude() } : {}),
  },
  {
    model: ProposalStatusType,
    required: Array.isArray(statusNames) && statusNames.length > 0,
    ...(Array.isArray(statusNames) && statusNames.length > 0
      ? { where: { name: { [Op.in]: statusNames } } }
      : {}),
  },
];

export const getProposalDetailInclude = () => [
  {
    model: Freight,
    required: false,
    include: getFreightNestedInclude(),
  },
  { model: ProposalStatusType, required: false },
];

const normalizeSearchTerm = (raw: string | undefined): string | undefined => {
  const term = raw?.trim();
  return term && term.length > 0 ? term : undefined;
};

const getAcceptedProposalStatus = async () => {
  return ProposalStatusType.findOne({
    where: { name: { [Op.in]: [...ACCEPTED_PROPOSAL_STATUS_NAMES] } },
  });
};

const getProposalStatusByName = async (name: string, transaction?: Transaction) => {
  return ProposalStatusType.findOne({ where: { name }, transaction });
};

export class ProposalNotFoundError extends Error {
  constructor() {
    super('NOT_FOUND');
  }
}

export class ProposalForbiddenError extends Error {
  constructor() {
    super('FORBIDDEN');
  }
}

export class ProposalValidationError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

type CreateProposalBody = z.infer<typeof createProposalSchema>;
type UpdateProposalBody = z.infer<typeof updateProposalSchema>;
type ProposalListQuery = z.infer<typeof proposalListQuerySchema>;
type ProposalFreightSummaryQuery = z.infer<typeof proposalFreightSummaryQuerySchema>;

export async function fetchProposalFreightSummaryRecord(
  query: ProposalFreightSummaryQuery,
  companyId?: number,
) {
  return fetchProposalFreightSummary({ ...query, companyId });
}

export async function createProposalRecord(body: CreateProposalBody, driverId: number) {
  const freight = await Freight.findByPk(body.freight_id);
  if (!freight) {
    throw new ProposalNotFoundError();
  }

  const enviadaStatus = await ProposalStatusType.findOne({
    where: { name: ProposalStatusSlug.ENVIADA },
  });

  const proposal = await Proposal.create({
    ...body,
    driver_id: driverId,
    status_id: enviadaStatus?.id,
  });

  if (freight.company_id != null && proposal.id != null) {
    notifyCompanyProposalSent(Number(freight.company_id), {
      proposalId: proposal.id,
      freightId: freight.id,
    });
  }

  return proposal;
}

export async function listProposals(
  query: ProposalListQuery,
  user?: { role?: string; id?: number },
) {
  const where: { freight_id?: number; driver_id?: number } = {};

  if (query.freight_id != null) {
    where.freight_id = query.freight_id;
  }

  if (user?.role === 'USER') {
    where.driver_id = user.id;
  }

  const statusFromProposalView = mapProposalStatusFilterToDomainNames(query.proposal_status);
  const statusFilter = query.status;
  const statusNamesFromLegacy = Array.isArray(statusFilter)
    ? statusFilter
    : statusFilter != null
      ? [statusFilter]
      : undefined;
  const statusNames = statusFromProposalView ?? statusNamesFromLegacy;
  const usePagination = query.page != null;
  const include = getProposalInclude(statusNames, usePagination);
  const searchTerm = normalizeSearchTerm(query.search);

  if (user?.role === 'COMPANY') {
    const freightInclude = include.find((entry) => entry.model === Freight);
    if (freightInclude) {
      freightInclude.required = true;
      (freightInclude as { where?: { company_id: number } }).where = { company_id: user.id! };
    }
  }

  if (searchTerm) {
    const freightInclude = include.find((entry) => entry.model === Freight);
    if (freightInclude) {
      const searchLike = `%${searchTerm}%`;
      (freightInclude as { where?: Record<string, unknown> }).where = {
        ...((freightInclude as { where?: Record<string, unknown> }).where ?? {}),
        [Op.or]: [
          { name: { [Op.like]: searchLike } },
          { origin_label: { [Op.like]: searchLike } },
          { destination_label: { [Op.like]: searchLike } },
        ],
      };
    }
  }

  const whereClause = Object.keys(where).length > 0 ? where : undefined;
  const order: [string, string][] = [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ];

  if (usePagination) {
    const page = query.page!;
    const limit = query.limit ?? 20;
    const { rows, count } = await Proposal.findAndCountAll({
      where: whereClause,
      include,
      limit,
      offset: (page - 1) * limit,
      order,
    });
    const total = typeof count === 'number' ? count : (count as { length: number }).length;
    const hasMore = page * limit < total;

    const summary = await fetchProposalListSummary({
      companyId: user?.role === 'COMPANY' ? user.id : undefined,
      search: searchTerm,
    });

    return { items: rows, total, page, limit, hasMore, summary, paginated: true as const };
  }

  const proposals = await Proposal.findAll({ where: whereClause, include, order });
  return { items: proposals, paginated: false as const };
}

export async function getProposalByIdRecord(id: number) {
  return Proposal.findByPk(id, { include: getProposalDetailInclude() });
}

export function assertCanViewProposal(
  proposal: Proposal & { Freight?: Freight | null },
  user?: { role?: string; id?: number },
) {
  if (user?.role === 'USER' && user.id !== Number(proposal.driver_id)) {
    throw new ProposalForbiddenError();
  }
  if (user?.role === 'COMPANY') {
    const freight = proposal.Freight;
    if (!freight || user.id !== Number(freight.company_id)) {
      throw new ProposalForbiddenError();
    }
  }
}

export async function updateProposalRecord(
  id: number,
  body: UpdateProposalBody,
  user: { role?: string; id?: number },
) {
  const proposal = await Proposal.findByPk(id);
  if (!proposal) {
    throw new ProposalNotFoundError();
  }

  if (user?.role !== 'ADMIN' && user?.id !== Number(proposal.driver_id)) {
    throw new ProposalForbiddenError();
  }

  await proposal.update(body);
  return proposal;
}

export async function deleteProposalRecord(id: number, user: { role?: string; id?: number }) {
  const proposal = await Proposal.findByPk(id);
  if (!proposal) {
    throw new ProposalNotFoundError();
  }

  if (user?.role !== 'ADMIN' && user?.id !== Number(proposal.driver_id)) {
    throw new ProposalForbiddenError();
  }

  const enviadaStatus = await getProposalStatusByName(ProposalStatusSlug.ENVIADA);
  if (
    enviadaStatus?.id != null &&
    proposal.status_id != null &&
    Number(proposal.status_id) !== Number(enviadaStatus.id)
  ) {
    throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
  }

  await proposal.destroy();
}

export async function acceptProposalRecord(
  id: number,
  user: { role?: string; id?: number },
) {
  const transaction = await sequelize.transaction();

  try {
    const proposal = await Proposal.findByPk(id, { transaction });
    if (!proposal) {
      await transaction.rollback();
      throw new ProposalNotFoundError();
    }

    const freight = await Freight.findByPk(proposal.freight_id, { transaction });
    if (!freight) {
      await transaction.rollback();
      throw new ProposalNotFoundError();
    }

    if (user?.role !== 'ADMIN' && user?.id !== Number(freight.company_id)) {
      await transaction.rollback();
      throw new ProposalForbiddenError();
    }

    const [awaitingDriverStatus, acceptedStatus, rejectedStatus, notSelectedStatus, enviadaStatus] =
      await Promise.all([
        getProposalStatusByName(ProposalStatusSlug.ESPERANDO_CAMINHONEIRO, transaction),
        getAcceptedProposalStatus(),
        getProposalStatusByName(ProposalStatusSlug.RECUSADA, transaction),
        getProposalStatusByName(ProposalStatusSlug.NAO_SELECIONADA, transaction),
        getProposalStatusByName(ProposalStatusSlug.ENVIADA, transaction),
      ]);

    if (!awaitingDriverStatus) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    const blockedStatuses = [
      rejectedStatus?.id,
      notSelectedStatus?.id,
      awaitingDriverStatus.id,
      acceptedStatus?.id,
    ].filter((statusId): statusId is number => statusId != null);

    if (proposal.status_id != null && blockedStatuses.includes(Number(proposal.status_id))) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.ACCEPT_FAILED');
    }

    if (!notSelectedStatus || !enviadaStatus) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    if (freight.assignedDriver_id != null) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.ACCEPT_FAILED');
    }

    await proposal.update({ status_id: awaitingDriverStatus.id }, { transaction });

    const otherProposals = await Proposal.findAll({
      where: {
        freight_id: proposal.freight_id,
        id: { [Op.ne]: proposal.id },
        status_id: enviadaStatus.id,
      },
      transaction,
    });

    await Proposal.update(
      { status_id: notSelectedStatus.id },
      {
        where: {
          freight_id: proposal.freight_id,
          id: { [Op.ne]: proposal.id },
          status_id: enviadaStatus.id,
        },
        transaction,
      },
    );

    await transaction.commit();

    if (proposal.driver_id != null) {
      notifyDriverAwaitingConfirmation(Number(proposal.driver_id), {
        proposalId: proposal.id,
        freightId: proposal.freight_id,
      });
    }

    for (const other of otherProposals) {
      if (other.driver_id == null) continue;
      notifyDriverProposalNotSelected(Number(other.driver_id), {
        proposalId: other.id,
        freightId: other.freight_id,
      });
    }

    return proposal;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function confirmProposalByDriverRecord(
  id: number,
  user: { role?: string; id?: number },
) {
  const transaction = await sequelize.transaction();

  try {
    const proposal = await Proposal.findByPk(id, { transaction });
    if (!proposal) {
      await transaction.rollback();
      throw new ProposalNotFoundError();
    }

    if (user?.role !== 'ADMIN' && user?.id !== Number(proposal.driver_id)) {
      await transaction.rollback();
      throw new ProposalForbiddenError();
    }

    const driverId = proposal.driver_id;
    const freightId = proposal.freight_id;

    if (driverId == null || freightId == null) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    const freight = await Freight.findByPk(freightId, { transaction });
    if (!freight) {
      await transaction.rollback();
      throw new ProposalNotFoundError();
    }

    const [awaitingDriverStatus, acceptedStatus, vinculadoStatus] = await Promise.all([
      getProposalStatusByName(ProposalStatusSlug.ESPERANDO_CAMINHONEIRO, transaction),
      getAcceptedProposalStatus(),
      FreightStatusType.findOne({ where: { name: FreightStatusSlug.VINCULADO }, transaction }),
    ]);

    if (!awaitingDriverStatus?.id || !acceptedStatus?.id) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    if (Number(proposal.status_id) !== Number(awaitingDriverStatus.id)) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    if (freight.assignedDriver_id != null && freight.assignedDriver_id !== driverId) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    const enviadaStatus = await getProposalStatusByName(ProposalStatusSlug.ENVIADA, transaction);

    await proposal.update({ status_id: acceptedStatus.id }, { transaction });

    if (enviadaStatus?.id) {
      await Proposal.update(
        { status_id: enviadaStatus.id },
        {
          where: {
            driver_id: driverId,
            status_id: awaitingDriverStatus.id,
            id: { [Op.ne]: proposal.id },
          },
          transaction,
        },
      );
    }

    const previousFreightStatusId = freight.status_id ?? null;
    await freight.update(
      {
        assignedDriver_id: driverId,
        finalValue: proposal.value,
        ...(vinculadoStatus?.id != null ? { status_id: vinculadoStatus.id } : {}),
      },
      { transaction },
    );

    if (vinculadoStatus?.id != null) {
      await recordFreightStatusHistory(freightId, vinculadoStatus.id, previousFreightStatusId, {
        transaction,
      });
    }

    await transaction.commit();

    if (freight.company_id != null) {
      notifyCompanyProposalAccepted(Number(freight.company_id), {
        proposalId: proposal.id,
        freightId: proposal.freight_id ?? undefined,
      });
    }

    return proposal;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function declineProposalByDriverRecord(
  id: number,
  user: { role?: string; id?: number },
) {
  const transaction = await sequelize.transaction();

  try {
    const proposal = await Proposal.findByPk(id, { transaction });
    if (!proposal) {
      await transaction.rollback();
      throw new ProposalNotFoundError();
    }

    if (user?.role !== 'ADMIN' && user?.id !== Number(proposal.driver_id)) {
      await transaction.rollback();
      throw new ProposalForbiddenError();
    }

    const [awaitingDriverStatus, rejectedStatus, notSelectedStatus, enviadaStatus] =
      await Promise.all([
        getProposalStatusByName(ProposalStatusSlug.ESPERANDO_CAMINHONEIRO, transaction),
        getProposalStatusByName(ProposalStatusSlug.RECUSADA, transaction),
        getProposalStatusByName(ProposalStatusSlug.NAO_SELECIONADA, transaction),
        getProposalStatusByName(ProposalStatusSlug.ENVIADA, transaction),
      ]);

    if (!awaitingDriverStatus?.id || !rejectedStatus?.id) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    if (Number(proposal.status_id) !== Number(awaitingDriverStatus.id)) {
      await transaction.rollback();
      throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
    }

    await proposal.update({ status_id: rejectedStatus.id }, { transaction });

    if (notSelectedStatus?.id && enviadaStatus?.id) {
      await Proposal.update(
        { status_id: enviadaStatus.id },
        {
          where: { freight_id: proposal.freight_id, status_id: notSelectedStatus.id },
          transaction,
        },
      );
    }

    await transaction.commit();
    return proposal;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function rejectProposalRecord(
  id: number,
  user: { role?: string; id?: number },
) {
  const proposal = await Proposal.findByPk(id);
  if (!proposal) {
    throw new ProposalNotFoundError();
  }

  const freight = await Freight.findByPk(proposal.freight_id);
  if (!freight) {
    throw new ProposalNotFoundError();
  }

  if (user?.role !== 'ADMIN' && user?.id !== Number(freight.company_id)) {
    throw new ProposalForbiddenError();
  }

  const rejectedStatus = await ProposalStatusType.findOne({
    where: { name: ProposalStatusSlug.RECUSADA },
  });

  if (!rejectedStatus) {
    throw new ProposalValidationError('PROPOSAL.UPDATE_FAILED');
  }

  await proposal.update({ status_id: rejectedStatus.id });

  if (proposal.driver_id != null) {
    notifyDriverProposalRejected(Number(proposal.driver_id), {
      proposalId: proposal.id,
      freightId: proposal.freight_id,
    });
  }

  return proposal;
}

export { normalizeSearchTerm };
