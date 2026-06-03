-- Executar manualmente no banco do company-service
ALTER TABLE company ADD COLUMN isPaid TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE company ADD COLUMN payment_token_hash VARCHAR(255) NULL;
