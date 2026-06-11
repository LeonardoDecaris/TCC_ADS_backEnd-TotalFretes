-- Comentário opcional da empresa ao recusar proposta.
-- Executar manualmente no banco do freight-service (sync usa alter: false).

ALTER TABLE proposals
  ADD COLUMN rejection_comment VARCHAR(500) NULL
  AFTER value;
