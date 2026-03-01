import { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

// Zod schema for validation
const querySchema = z.object({
  coordenadasMotorista: z.string().regex(/^[-+]?\d*\.\d+,[-+]?\d*\.\d+$/, 'Formato inválido para coordenadas (longitude,latitude)'),
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

    // Convert addresses to coordinates
    const motoristaCoords = coordenadasMotorista.split(',').map(Number) as [number, number];
    const cargaCoords = await getCoordinates(moradaCarga);
    const destinoCoords = await getCoordinates(moradaDestino);

    // Get route from Mapbox Directions API
    const routeData = await getRoute([motoristaCoords, cargaCoords, destinoCoords]);

    // Extract and structure response data
    const legs = routeData.routes[0].legs;
    const response = {
      distancia_total_km: routeData.routes[0].distance / 1000,
      tempo_total_min: routeData.routes[0].duration / 60,
      trecho_ate_carga: {
        distancia_km: legs[0].distance / 1000,
        tempo_min: legs[0].duration / 60,
      },
      coords_carga: cargaCoords,
      trecho_carga_ao_destino: {
        distancia_km: legs[1].distance / 1000,
        tempo_min: legs[1].duration / 60,
      },
      coords_destino: destinoCoords,
      geometria: routeData.routes[0].geometry,
    };

    res.json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}