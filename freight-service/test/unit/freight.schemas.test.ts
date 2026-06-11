import { createFreightSchema } from '../../src/schemas/freight.schemas';

const validFreight = {
  cargoType_id: 1,
  name: 'Frete teste',
  origin_label: 'Origem',
  origin_lat: -23.5,
  origin_lng: -46.6,
  destination_label: 'Destino',
  destination_lat: -22.9,
  destination_lng: -43.2,
  originalValue: 1500,
  weight: 500,
};

describe('createFreightSchema', () => {
  it('aceita payload válido', () => {
    const result = createFreightSchema.safeParse(validFreight);
    expect(result.success).toBe(true);
  });

  it('rejeita latitude inválida', () => {
    const result = createFreightSchema.safeParse({ ...validFreight, origin_lat: 95 });
    expect(result.success).toBe(false);
  });

  it('rejeita peso negativo ou zero', () => {
    const result = createFreightSchema.safeParse({ ...validFreight, weight: 0 });
    expect(result.success).toBe(false);
  });
});
