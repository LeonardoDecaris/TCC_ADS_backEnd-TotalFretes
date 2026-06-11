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
  { groupNome: "Caminhão", nome: "Caminhão 2 eixos", axes: 2, weight: 3000, capacityWeight: 4000, length: 6000 },
  { groupNome: "Caminhão", nome: "Caminhão 2 eixos", axes: 2, weight: 5000, capacityWeight: 7000, length: 7000 },
  { groupNome: "Caminhão", nome: "Caminhão 3 eixos", axes: 3, weight: 6500, capacityWeight: 12000, length: 8500 },
  { groupNome: "Caminhão", nome: "Caminhão 3 eixos", axes: 3, weight: 8000, capacityWeight: 18000, length: 9500 },

  // Carreta
  { groupNome: "Carreta", nome: "Carreta 3 eixos", axes: 3, weight: 9000, capacityWeight: 25000, length: 12000 },
  { groupNome: "Carreta", nome: "Carreta 4 eixos", axes: 4, weight: 10000, capacityWeight: 30000, length: 14000 },
  { groupNome: "Carreta", nome: "Carreta 5 eixos", axes: 5, weight: 11000, capacityWeight: 35000, length: 16000 },
  { groupNome: "Carreta", nome: "Carreta 6 eixos", axes: 6, weight: 13000, capacityWeight: 40000, length: 18000 },
  { groupNome: "Carreta", nome: "Carreta 7 eixos", axes: 7, weight: 15000, capacityWeight: 45000, length: 19000 },

  // Bitrem
  { groupNome: "Bitrem", nome: "Bitrem 6 eixos", axes: 6, weight: 16000, capacityWeight: 40000, length: 24000 },
  { groupNome: "Bitrem", nome: "Bitrem 7 eixos", axes: 7, weight: 20000, capacityWeight: 45000, length: 26000 },
  { groupNome: "Bitrem", nome: "Bitrem 9 eixos", axes: 9, weight: 22000, capacityWeight: 50000, length: 30000 },

  // RoadTrain
  { groupNome: "RoadTrain", nome: "RoadTrain 9 eixos", axes: 9, weight: 22000, capacityWeight: 50000, length: 30000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 10 eixos", axes: 10, weight: 24000, capacityWeight: 55000, length: 32000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 11 eixos", axes: 11, weight: 26000, capacityWeight: 60000, length: 34000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 12 eixos", axes: 12, weight: 28000, capacityWeight: 65000, length: 36000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 13 eixos", axes: 13, weight: 30000, capacityWeight: 70000, length: 38000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 14 eixos", axes: 14, weight: 32000, capacityWeight: 75000, length: 40000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 15 eixos", axes: 15, weight: 34000, capacityWeight: 80000, length: 42000 },
  { groupNome: "RoadTrain", nome: "RoadTrain 16 eixos", axes: 16, weight: 36000, capacityWeight: 85000, length: 44000 },

  // Prancha
  { groupNome: "Prancha", nome: "Prancha 2 eixos", axes: 2, weight: 4000, capacityWeight: 7000, length: 7000 },
  { groupNome: "Prancha", nome: "Prancha 3 eixos", axes: 3, weight: 5000, capacityWeight: 8000, length: 8000 },
  { groupNome: "Prancha", nome: "Prancha 4 eixos", axes: 4, weight: 7000, capacityWeight: 10000, length: 9000 },

  // Cegonha
  { groupNome: "Cegonha", nome: "Cegonha 5 eixos", axes: 5, weight: 15000, capacityWeight: 40000, length: 18000 },
  { groupNome: "Cegonha", nome: "Cegonha 6 eixos", axes: 6, weight: 18000, capacityWeight: 45000, length: 20000 },
  { groupNome: "Cegonha", nome: "Cegonha 7 eixos", axes: 7, weight: 20000, capacityWeight: 50000, length: 22000 },
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
