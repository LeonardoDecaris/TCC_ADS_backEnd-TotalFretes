-- Remove coluna obsoleta vehicleMinimumCapacity de cargo_types (freight-service DB)
-- Executar nos bancos existentes após deploy.

ALTER TABLE cargo_types DROP COLUMN IF EXISTS vehicleMinimumCapacity;
