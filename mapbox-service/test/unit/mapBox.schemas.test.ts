import {
  forwardQuerySchema,
  reverseQuerySchema,
  routeQuerySchema,
  normalizeRouteQuery,
} from '../../src/schemas/mapBox.schemas';

describe('mapBox schemas', () => {
  it('forwardQuerySchema exige consulta com tamanho mínimo', () => {
    expect(forwardQuerySchema.safeParse({ q: 'a' }).success).toBe(false);
    expect(forwardQuerySchema.safeParse({ q: 'São Paulo' }).success).toBe(true);
  });

  it('reverseQuerySchema valida coordenadas', () => {
    expect(reverseQuerySchema.safeParse({ lng: -46.6, lat: -23.5 }).success).toBe(true);
    expect(reverseQuerySchema.safeParse({ lng: 200, lat: 0 }).success).toBe(false);
  });

  it('routeQuerySchema exige moradaDestino e origem', () => {
    const result = routeQuerySchema.safeParse({
      moradaDestino: 'Rio de Janeiro',
      moradaCarga: 'São Paulo',
    });
    expect(result.success).toBe(true);
  });

  it('normalizeRouteQuery converte arrays em string', () => {
    const normalized = normalizeRouteQuery({
      moradaDestino: ['Rio'],
      coordenadasOrigem: ['-43.2', '-22.9'],
    });
    expect(normalized.moradaDestino).toBe('Rio');
    expect(normalized.coordenadasOrigem).toBe('-43.2,-22.9');
  });

  it('routeQuerySchema rejeita sem moradaCarga nem coordenadasOrigem', () => {
    const result = routeQuerySchema.safeParse({ moradaDestino: 'Rio de Janeiro' });
    expect(result.success).toBe(false);
  });

  it('routeQuerySchema rejeita coordenadasMotorista e coordenadasOrigem juntos', () => {
    const result = routeQuerySchema.safeParse({
      moradaDestino: 'Rio de Janeiro',
      moradaCarga: 'São Paulo',
      coordenadasMotorista: '-46.6,-23.5',
      coordenadasOrigem: '-43.2,-22.9',
    });
    expect(result.success).toBe(false);
  });
});
