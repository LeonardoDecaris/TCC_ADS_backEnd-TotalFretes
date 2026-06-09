import { Request, Response } from 'express';
import { ingestLocationSchema, trailParamsSchema } from '../schemas/telemetry.schemas';
import {
  assertCanPublishLocation,
  assertCanViewTrail,
  fetchFreightById,
} from '../services/freightClient';
import {
  getFreightTrail,
  getLatestDriverPosition,
  ingestDriverLocation,
} from '../services/telemetry.service';
import { handleControllerError } from '../utils/mapBoxError';

function getAuthHeader(req: Request): string {
  return req.headers.authorization?.trim() ?? '';
}

export async function postDriverLocation(req: Request, res: Response) {
  try {
    const input = ingestLocationSchema.parse(req.body);
    const user = req.user!;

    const freight = await fetchFreightById(input.freightId, getAuthHeader(req));
    if (!freight) {
      return res.status(404).json({ message: 'Frete não encontrado' });
    }

    assertCanPublishLocation(freight, user);

    const point = await ingestDriverLocation(input, user.id);

    return res.status(201).json({
      freightId: input.freightId,
      point,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'FORBIDDEN_PUBLISH') {
        return res.status(403).json({ message: 'Sem permissão para publicar localização neste frete' });
      }
    }
    return handleControllerError(error, res);
  }
}

export async function getDriverTrail(req: Request, res: Response) {
  try {
    const { freightId } = trailParamsSchema.parse(req.params);
    const user = req.user!;

    const freight = await fetchFreightById(freightId, getAuthHeader(req));
    if (!freight) {
      return res.status(404).json({ message: 'Frete não encontrado' });
    }

    assertCanViewTrail(freight, user);

    const [points, latest] = await Promise.all([
      getFreightTrail(freightId),
      getLatestDriverPosition(freightId),
    ]);

    return res.json({
      freightId,
      points,
      latest,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'FORBIDDEN_VIEW') {
        return res.status(403).json({ message: 'Sem permissão para visualizar este frete' });
      }
    }
    return handleControllerError(error, res);
  }
}
