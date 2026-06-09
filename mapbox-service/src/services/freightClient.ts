import axios from 'axios';

export type FreightRecord = {
  id: number;
  company_id: number;
  assignedDriver_id?: number | null;
};

const FREIGHT_SERVICE_URL =
  process.env.FREIGHT_SERVICE_URL?.trim() || 'http://freight-service:3008';

export async function fetchFreightById(
  freightId: number,
  authorizationHeader: string,
): Promise<FreightRecord | null> {
  try {
    const { data } = await axios.get<FreightRecord>(`${FREIGHT_SERVICE_URL}/freight/${freightId}`, {
      headers: { Authorization: authorizationHeader },
      timeout: 5000,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export function assertCanPublishLocation(
  freight: FreightRecord,
  user: { id: number; role: string },
): void {
  if (user.role === 'ADMIN') return;
  if (user.role !== 'USER') {
    throw new Error('FORBIDDEN_PUBLISH');
  }
  if (Number(freight.assignedDriver_id) !== Number(user.id)) {
    throw new Error('FORBIDDEN_PUBLISH');
  }
}

export function assertCanViewTrail(
  freight: FreightRecord,
  user: { id: number; role: string },
): void {
  if (user.role === 'ADMIN') return;
  if (user.role === 'COMPANY') {
    if (Number(freight.company_id) !== Number(user.id)) {
      throw new Error('FORBIDDEN_VIEW');
    }
    return;
  }
  if (user.role === 'USER') {
    if (Number(freight.assignedDriver_id) !== Number(user.id)) {
      throw new Error('FORBIDDEN_VIEW');
    }
    return;
  }
  throw new Error('FORBIDDEN_VIEW');
}
