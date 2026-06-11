import { createVehicleSchema } from '../../src/schemas/vehicle.schemas';

describe('createVehicleSchema', () => {
  it('normaliza aliases plate e state para plateNumber e stateUF', () => {
    const result = createVehicleSchema.safeParse({
      plate: 'ABC1D23',
      state: 'SP',
      city: 'São Paulo',
      country: 'BR',
      vehicleType_id: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.plateNumber).toBe('ABC1D23');
    expect(result.data.stateUF).toBe('SP');
  });

  it('rejeita payload sem city', () => {
    const result = createVehicleSchema.safeParse({
      plateNumber: 'ABC1D23',
      stateUF: 'SP',
      country: 'BR',
      vehicleType_id: 1,
    });
    expect(result.success).toBe(false);
  });
});
