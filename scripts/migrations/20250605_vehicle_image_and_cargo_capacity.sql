-- Migração manual: imagem de veículo, capacidade mínima de carga e grupos
-- Executar nos bancos existentes após deploy (sequelize.sync alter: false não aplica alterações).

-- ========== storage-service DB ==========
DROP TABLE IF EXISTS VEHICLE_IMAGES;

-- ========== freight-service DB ==========
ALTER TABLE cargo_types ADD COLUMN vehicleMinimumCapacity INT NOT NULL DEFAULT 0;
UPDATE cargo_types SET vehicleMinimumCapacity = 45000 WHERE vehicleType = '4';
UPDATE cargo_types SET vehicleMinimumCapacity = 51000 WHERE vehicleType = '5';
UPDATE cargo_types SET vehicleMinimumCapacity = 45000 WHERE vehicleType NOT IN ('4', '5') AND vehicleMinimumCapacity = 0;
ALTER TABLE cargo_types DROP COLUMN vehicleType;
ALTER TABLE cargo_types ALTER COLUMN vehicleMinimumCapacity DROP DEFAULT;

-- ========== user-service DB ==========
-- Remover tipos de veículo do grupo antigo (se existirem)
DELETE FROM vehicle_types
WHERE groupVehicleType_id IN (
  SELECT id FROM group_vehicle_types WHERE nome = 'Para carga de líquidos'
);

-- Remover grupo obsoleto
DELETE FROM group_vehicle_types WHERE nome = 'Para carga de líquidos';

-- Nota: novos grupos Prancha e Cegonha são criados pelo seed na próxima subida do user-service.
