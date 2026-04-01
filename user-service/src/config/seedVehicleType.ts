import GroupVehicleType from "../models/groupVehicleType.model";
import VehicleType from "../models/vehicleType.model";

const DEFAULT_VEHICLE_TYPES_BY_GROUP: Array<{
  groupNome: string;
  nome: string;
  axes: number;
  weight: number;
  capacityWeight: number;
  length: number;
}> = [
  { groupNome: "Caminhão", nome: "Caminhão 2 eixos", axes: 2, weight: 23000, capacityWeight: 23000, length: 1400 },
  { groupNome: "Carreta", nome: "Carreta 3 eixos", axes: 3, weight: 41000, capacityWeight: 41000, length: 1800 },
  { groupNome: "Bitrem", nome: "Bitrem 4 eixos", axes: 4, weight: 57000, capacityWeight: 57000, length: 2500 },
];

export const seedVehicleType = async (): Promise<void> => {
  for (const { groupNome, nome, axes, weight, capacityWeight, length } of DEFAULT_VEHICLE_TYPES_BY_GROUP) {
    const group = await GroupVehicleType.findOne({ where: { nome: groupNome } });
    if (!group?.id) continue;
    await VehicleType.findOrCreate({
      where: { nome, groupVehicleType_id: group.id },
      defaults: { nome, axes, weight, capacityWeight, length, groupVehicleType_id: group.id },
    });
  }
};
