import type { Order, Transaction } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { FreightStatusSlug, ProposalStatusSlug } from '../config/statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import type { createFreightSchema, freightListPaginatedQuerySchema, updateFreightSchema } from '../schemas/freight.schemas';
import type { z } from 'zod';
import { recordFreightStatusHistory } from './freightStatusHistory.service';
import {
  notifyCompanyFreightCancelled,
  notifyCompanyFreightDelivered,
  notifyCompanyFreightInTransit,
  notifyDriversFreightCancelled,
} from '../messaging/notificationEvents';

export const getFreightStatusHistoryInclude = () => ({
  model: FreightStatusHistory,
  as: 'FreightStatusHistories',
  required: false,
  separate: true,
  order: [['occurred_at', 'ASC']] as Order,
  include: [
    {
      model: FreightStatusType,
      required: false,
    },
  ],
});

export const getFreightListInclude = () => [
  {
    model: CargoType,
    as: 'cargo',
    required: false,
  },
  {
    model: FreightStatusType,
    as: 'status',
    required: false,
  },
  getFreightStatusHistoryInclude(),
];

export const getFreightDetailInclude = () => [...getFreightListInclude()];

const getProposalStatusByName = async (name: string, transaction?: Transaction) => {
  return ProposalStatusType.findOne({
    where: { name },
    transaction,
  });
};

export const markFreightProposalsAsNotSelected = async (freightId: number, transaction?: Transaction) => {
  const notSelectedStatus = await getProposalStatusByName(
    ProposalStatusSlug.NAO_SELECIONADA,
    transaction,
  );

  if (!notSelectedStatus?.id) {
    throw new Error(`Proposal status not found: ${ProposalStatusSlug.NAO_SELECIONADA}`);
  }

  await Proposal.update(
    { status_id: notSelectedStatus.id },
    { where: { freight_id: freightId }, transaction },
  );
};

export const buildFreightListWhere = async (user?: { role?: string; id?: number }) => {
  if (user?.role === 'ADMIN') return undefined;
  if (user?.role === 'COMPANY') return { company_id: user.id };
  if (user?.role === 'USER') {
    const disponivelStatus = await FreightStatusType.findOne({
      where: { name: FreightStatusSlug.DISPONIVEL },
    });
    if (disponivelStatus?.id != null) {
      return { status_id: disponivelStatus.id };
    }
  }
  return undefined;
};

const NON_ONGOING_DRIVER_STATUSES: readonly string[] = [
  FreightStatusSlug.CONCLUIDO,
  FreightStatusSlug.CANCELADO,
];

const DRIVER_VALID_TRANSITIONS: Record<string, readonly string[]> = {
  [FreightStatusSlug.VINCULADO]: [FreightStatusSlug.EM_TRANSITO],
  [FreightStatusSlug.EM_TRANSITO]: [FreightStatusSlug.EM_ROTA_ENTREGA],
  [FreightStatusSlug.EM_ROTA_ENTREGA]: [FreightStatusSlug.ENTREGUE],
};

type CreateFreightBody = z.infer<typeof createFreightSchema>;
type UpdateFreightBody = z.infer<typeof updateFreightSchema>;
type FreightListQuery = z.infer<typeof freightListPaginatedQuerySchema>;

export async function createFreightRecord(body: CreateFreightBody, companyId: number) {
  const defaultStatus = await FreightStatusType.findOne({
    where: { name: FreightStatusSlug.DISPONIVEL },
  });

  const statusId = body.status_id ?? defaultStatus?.id;

  const freight = await Freight.create({
    ...body,
    company_id: companyId,
    status_id: statusId,
  });

  if (freight.id != null && statusId != null) {
    await recordFreightStatusHistory(freight.id, statusId, null);
  }

  if (freight.id == null) {
    return freight;
  }

  return Freight.findByPk(freight.id, { include: getFreightDetailInclude() });
}

export async function listFreights(
  user: { role?: string; id?: number } | undefined,
  query?: FreightListQuery,
  usePagination = false,
) {
  const where = await buildFreightListWhere(user);
  const listInclude = getFreightListInclude();
  const listOrder: Order = [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ];

  if (usePagination && query) {
    const { rows, count } = await Freight.findAndCountAll({
      where,
      include: listInclude,
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      order: listOrder,
    });

    const total = typeof count === 'number' ? count : (count as { length: number }).length;
    const hasMore = query.page * query.limit < total;

    return { items: rows, total, page: query.page, limit: query.limit, hasMore, paginated: true as const };
  }

  const freights = await Freight.findAll({ where, include: listInclude, order: listOrder });
  return { items: freights, paginated: false as const };
}

export async function getFreightByIdRecord(id: number) {
  return Freight.findByPk(id, { include: getFreightDetailInclude() });
}

export async function getFreightByUserIdRecord(userId: string | number) {
  const excludedStatuses = await FreightStatusType.findAll({
    where: { name: { [Op.in]: [...NON_ONGOING_DRIVER_STATUSES] } },
    attributes: ['id'],
  });
  const excludedIds = excludedStatuses.map((s) => s.id).filter((id): id is number => id != null);

  return Freight.findOne({
    where: {
      assignedDriver_id: userId,
      ...(excludedIds.length > 0 ? { status_id: { [Op.notIn]: excludedIds } } : {}),
    },
    include: getFreightListInclude(),
    order: [['updatedAt', 'DESC']],
  });
}

export class FreightForbiddenError extends Error {
  constructor() {
    super('FORBIDDEN');
  }
}

export class FreightNotFoundError extends Error {
  constructor() {
    super('NOT_FOUND');
  }
}

export class FreightValidationError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export async function updateFreightRecord(
  id: number,
  body: UpdateFreightBody,
  user: { role?: string; id?: number },
) {
  const transaction = await sequelize.transaction();
  let transactionCommitted = false;

  try {
    const freight = await Freight.findByPk(id, { transaction });
    if (!freight) {
      await transaction.rollback();
      throw new FreightNotFoundError();
    }

    const role = user?.role;
    const isAdmin = role === 'ADMIN';
    const isOwnerCompany = role === 'COMPANY' && user?.id === Number(freight.company_id);
    const isAssignedDriver = role === 'USER' && user?.id === Number(freight.assignedDriver_id);

    if (!isAdmin && !isOwnerCompany && !isAssignedDriver) {
      await transaction.rollback();
      throw new FreightForbiddenError();
    }

    const previousStatusId = freight.status_id ?? null;
    let driverTargetStatusName: string | null = null;

    if (isAssignedDriver && !isAdmin) {
      if (body.status_id == null) {
        await transaction.rollback();
        throw new FreightValidationError('FREIGHT.STATUS_REQUIRED');
      }

      const [currentStatus, targetStatus] = await Promise.all([
        previousStatusId != null
          ? FreightStatusType.findByPk(previousStatusId, { transaction })
          : Promise.resolve(null),
        FreightStatusType.findByPk(body.status_id, { transaction }),
      ]);

      const allowedNextNames = currentStatus?.name ? DRIVER_VALID_TRANSITIONS[currentStatus.name] ?? [] : [];
      const targetName = targetStatus?.name ?? null;

      if (!targetName || !allowedNextNames.includes(targetName)) {
        await transaction.rollback();
        throw new FreightValidationError('FREIGHT.INVALID_STATUS_TRANSITION');
      }

      driverTargetStatusName = targetName;

      await freight.update({ status_id: body.status_id }, { transaction });

      if (freight.id != null) {
        await recordFreightStatusHistory(freight.id, body.status_id, previousStatusId, { transaction });
      }
    } else {
      await freight.update(body, { transaction });

      if (body.status_id !== undefined && freight.id != null) {
        const canceladoStatus = await FreightStatusType.findOne({
          where: { name: FreightStatusSlug.CANCELADO },
          transaction,
        });
        const canceladoStatusId = canceladoStatus?.id ?? 2;

        if (body.status_id === canceladoStatusId) {
          await markFreightProposalsAsNotSelected(freight.id, transaction);
        }

        await recordFreightStatusHistory(freight.id, body.status_id, previousStatusId, { transaction });
      }
    }

    await transaction.commit();
    transactionCommitted = true;
    await freight.reload({ include: getFreightDetailInclude() });

    if (driverTargetStatusName && freight.company_id != null && freight.id != null) {
      const metadata = { freightId: freight.id };
      const notifyCompanyId = Number(freight.company_id);

      if (driverTargetStatusName === FreightStatusSlug.EM_TRANSITO) {
        notifyCompanyFreightInTransit(notifyCompanyId, metadata);
      }

      if (driverTargetStatusName === FreightStatusSlug.ENTREGUE) {
        notifyCompanyFreightDelivered(notifyCompanyId, metadata);
      }
    }

    return freight;
  } catch (error) {
    if (!transactionCommitted) {
      await transaction.rollback();
    }
    throw error;
  }
}

export async function deleteFreightRecord(id: number, user: { role?: string; id?: number }) {
  const transaction = await sequelize.transaction();

  try {
    const freight = await Freight.findByPk(id);
    if (!freight) {
      await transaction.rollback();
      throw new FreightNotFoundError();
    }

    if (user?.role !== 'ADMIN' && user?.id !== Number(freight.company_id)) {
      await transaction.rollback();
      throw new FreightForbiddenError();
    }

    await Proposal.destroy({ where: { freight_id: freight.id }, transaction });
    await FreightStatusHistory.destroy({ where: { freight_id: freight.id }, transaction });
    await freight.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function cancelFreightRecord(id: number, user: { role?: string; id?: number }) {
  const transaction = await sequelize.transaction();
  let transactionCommitted = false;

  try {
    const freight = await Freight.findByPk(id, { transaction });
    if (!freight) {
      await transaction.rollback();
      throw new FreightNotFoundError();
    }

    const canCancelFreight =
      user?.role === 'ADMIN' ||
      (user?.role === 'COMPANY' && user.id === Number(freight.company_id)) ||
      (user?.role === 'USER' && user.id === Number(freight.assignedDriver_id));

    if (!canCancelFreight) {
      await transaction.rollback();
      throw new FreightForbiddenError();
    }

    const canceladoStatus = await FreightStatusType.findOne({
      where: { name: FreightStatusSlug.CANCELADO },
      transaction,
    });

    const statusId = canceladoStatus?.id ?? 2;
    const previousStatusId = freight.status_id ?? null;
    const assignedDriverId = freight.assignedDriver_id;
    const companyId = freight.company_id;
    const cancelledByRole = user?.role;

    const proposalsBeforeCancel = await Proposal.findAll({
      where: { freight_id: freight.id },
      attributes: ['driver_id'],
      transaction,
    });

    await freight.update({ assignedDriver_id: null, status_id: statusId }, { transaction });

    if (freight.id != null) {
      await markFreightProposalsAsNotSelected(freight.id, transaction);
      await recordFreightStatusHistory(freight.id, statusId, previousStatusId, { transaction });
    }

    await transaction.commit();
    transactionCommitted = true;
    await freight.reload({ include: getFreightDetailInclude() });

    if (freight.id != null) {
      await notifyDriversFreightCancelled(
        freight.id,
        assignedDriverId,
        proposalsBeforeCancel.map((proposal) => proposal.driver_id),
      );

      if (companyId != null && cancelledByRole !== 'COMPANY') {
        notifyCompanyFreightCancelled(Number(companyId), { freightId: freight.id });
      }
    }

    return freight;
  } catch (error) {
    if (!transactionCommitted) {
      await transaction.rollback();
    }
    throw error;
  }
}

export async function completeFreightRecord(id: number, user: { role?: string; id?: number }) {
  const freight = await Freight.findByPk(id);
  if (!freight) {
    throw new FreightNotFoundError();
  }

  if (user?.role !== 'ADMIN' && user?.id !== Number(freight.company_id)) {
    throw new FreightForbiddenError();
  }

  const entregueStatus = await FreightStatusType.findOne({
    where: { name: FreightStatusSlug.ENTREGUE },
  });

  if (entregueStatus?.id != null && freight.status_id !== entregueStatus.id) {
    throw new FreightValidationError('FREIGHT.UPDATE_FAILED');
  }

  const concluidoStatus = await FreightStatusType.findOne({
    where: { name: FreightStatusSlug.CONCLUIDO },
  });

  if (!concluidoStatus?.id) {
    throw new FreightValidationError('FREIGHT.UPDATE_FAILED');
  }

  const previousStatusId = freight.status_id ?? null;
  await freight.update({ status_id: concluidoStatus.id });

  if (freight.id != null) {
    await recordFreightStatusHistory(freight.id, concluidoStatus.id, previousStatusId);
  }

  await freight.reload({ include: getFreightDetailInclude() });
  return freight;
}

export function assertCompanyCanViewFreight(
  freight: Freight,
  user?: { role?: string; id?: number },
) {
  if (user?.role === 'COMPANY' && user.id !== Number(freight.company_id)) {
    throw new FreightForbiddenError();
  }
}
