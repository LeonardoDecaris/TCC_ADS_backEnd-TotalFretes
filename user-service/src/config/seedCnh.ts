import CnhType from '../models/cnh.model';

const DEFAULT_CNH_TYPES = [
  { name: 'A', description: 'CNH' },
  { name: 'B', description: 'CNH B' },
  { name: 'C', description: 'CNH C' },
  { name: 'D', description: 'CNH D' },
  { name: 'E', description: 'CNH E' },
];

export const seedCnhTypes = async (): Promise<void> => {
  for (const { name, description } of DEFAULT_CNH_TYPES) {
    await CnhType.findOrCreate({
      where: { name },
      defaults: { name, description, userUpdateAt: new Date() },
    });
  }
};
