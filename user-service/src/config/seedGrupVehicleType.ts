import GroupVehicleType from "../models/groupVehicleType.model";

const DEFAULT_GROUP_VEHICLE_TYPES = [
  { nome: 'Caminhão', cnhType_id: 3 },
  { nome: 'Carreta', cnhType_id: 5 },
  { nome: 'Bitrem', cnhType_id: 5 },
  { nome: 'Prancha', cnhType_id: 3 },
  { nome: 'Cegonha', cnhType_id: 5 },
];

export const seedGroupVehicleType = async (): Promise<void> => {
  for (const { nome, cnhType_id } of DEFAULT_GROUP_VEHICLE_TYPES) {
    await GroupVehicleType.findOrCreate({
      where: { nome },
      defaults: { nome, cnhType_id },
    });
  }
};
