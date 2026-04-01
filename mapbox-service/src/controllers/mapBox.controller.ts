import { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

// Zod schema for validation (coordenadasMotorista opcional = rota só origem → destino)
const querySchema = z.object({
  coordenadasMotorista: z
    .string()
    .regex(/^[-+]?\d*\.\d+,[-+]?\d*\.\d+$/, 'Formato inválido para coordenadas (longitude,latitude)')
    .optional(),
  moradaCarga: z.string(),
  moradaDestino: z.string(),
});

// Helper function to call Mapbox Geocoding API
async function getCoordinates(address: string): Promise<[number, number]> {
  const token = process.env.MAPBOX_SECRET_TOKEN;
  if (!token) {
    throw new Error('MAPBOX_SECRET_TOKEN não configurado no .env');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const response = await axios.get(url, {
    params: {
      access_token: token,
      limit: 1,
    },
  });

  const features = response.data.features;
  if (!features || features.length === 0) {
    throw new Error(`Endereço não encontrado: ${address}`);
  }

  return features[0].center;
}

// Helper function to call Mapbox Directions API
async function getRoute(coordinates: [number, number][]): Promise<any> {
  const token = process.env.MAPBOX_SECRET_TOKEN;
  if (!token) {
    throw new Error('MAPBOX_SECRET_TOKEN não configurado no .env');
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.map(coord => coord.join(',')).join(';')}`;
  const response = await axios.get(url, {
    params: {
      access_token: token,
      geometries: 'geojson',
      overview: 'full',
    },
  });

  return response.data;
}

// Controller function
export async function getMapBoxRoute(req: Request, res: Response) {
  try {
    // Validate query parameters
    const { coordenadasMotorista, moradaCarga, moradaDestino } = querySchema.parse(req.query);

    const cargaCoords = await getCoordinates(moradaCarga);
    const destinoCoords = await getCoordinates(moradaDestino);

    let routeData: any;
    if (coordenadasMotorista) {
      // Rota em 3 pontos: motorista → carga → destino
      const motoristaCoords = coordenadasMotorista.split(',').map(Number) as [number, number];
      routeData = await getRoute([motoristaCoords, cargaCoords, destinoCoords]);
    } else {
      // Rota em 2 pontos: origem (carga) → destino (sem GPS do motorista)
      routeData = await getRoute([cargaCoords, destinoCoords]);
    }

    const route = routeData.routes[0];
    const legs = route.legs;

    const response: Record<string, unknown> = {
      distancia_total_km: route.distance / 1000,
      tempo_total_min: route.duration / 60,
      coords_carga: cargaCoords,
      coords_destino: destinoCoords,
      geometria: route.geometry,
    };

    if (legs.length >= 2) {
      response.trecho_ate_carga = {
        distancia_km: legs[0].distance / 1000,
        tempo_min: legs[0].duration / 60,
      };
      response.trecho_carga_ao_destino = {
        distancia_km: legs[1].distance / 1000,
        tempo_min: legs[1].duration / 60,
      };
    } else if (legs.length === 1) {
      response.trecho_ate_carga = null;
      response.trecho_carga_ao_destino = {
        distancia_km: legs[0].distance / 1000,
        tempo_min: legs[0].duration / 60,
      };
    }

    res.json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}