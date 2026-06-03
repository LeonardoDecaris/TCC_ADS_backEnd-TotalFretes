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
  // Caminhão
  { groupNome: "Caminhão", nome: "Caminhão 2 eixos", axes: 2, weight: 23000, capacityWeight: 23000, length: 1400 },
  { groupNome: "Caminhão", nome: "Caminhão 3 eixos", axes: 3, weight: 33000, capacityWeight: 33000, length: 1450 },

  // Carreta
  { groupNome: "Carreta", nome: "Carreta 3 eixos", axes: 3, weight: 41000, capacityWeight: 41000, length: 1800 },
  { groupNome: "Carreta", nome: "Carreta 4 eixos", axes: 4, weight: 45000, capacityWeight: 45000, length: 1950 },
  { groupNome: "Carreta", nome: "Carreta 5 eixos", axes: 5, weight: 51000, capacityWeight: 51000, length: 2100 },
  { groupNome: "Carreta", nome: "Carreta 6 eixos", axes: 6, weight: 57000, capacityWeight: 57000, length: 2250 },
  { groupNome: "Carreta", nome: "Carreta 7 eixos", axes: 7, weight: 74000, capacityWeight: 74000, length: 2400 },

  // Bitrem
  { groupNome: "Bitrem", nome: "Bitrem 4 eixos", axes: 4, weight: 57000, capacityWeight: 57000, length: 2500 },
  { groupNome: "Bitrem", nome: "Bitrem 5 eixos", axes: 5, weight: 57000, capacityWeight: 57000, length: 2650 },
  { groupNome: "Bitrem", nome: "Bitrem 6 eixos", axes: 6, weight: 57000, capacityWeight: 57000, length: 2800 },
  { groupNome: "Bitrem", nome: "Bitrem 7 eixos", axes: 7, weight: 74000, capacityWeight: 74000, length: 3000 },
  { groupNome: "Bitrem", nome: "Bitrem 9 eixos", axes: 9, weight: 74000, capacityWeight: 74000, length: 3000 },

  // Para carga de líquidos
  { groupNome: "Para carga de líquidos", nome: "Tanque 2 eixos", axes: 2, weight: 23000, capacityWeight: 23000, length: 1400 },
  { groupNome: "Para carga de líquidos", nome: "Tanque 3 eixos", axes: 3, weight: 33000, capacityWeight: 33000, length: 1450 },
  { groupNome: "Para carga de líquidos", nome: "Tanque 4 eixos", axes: 4, weight: 45000, capacityWeight: 45000, length: 1950 },
  { groupNome: "Para carga de líquidos", nome: "Tanque 5 eixos", axes: 5, weight: 51000, capacityWeight: 51000, length: 2100 },
  { groupNome: "Para carga de líquidos", nome: "Carreta tanque 6 eixos", axes: 6, weight: 57000, capacityWeight: 57000, length: 2250 },
  { groupNome: "Para carga de líquidos", nome: "Bitrem tanque 7 eixos", axes: 7, weight: 74000, capacityWeight: 74000, length: 3000 },
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
