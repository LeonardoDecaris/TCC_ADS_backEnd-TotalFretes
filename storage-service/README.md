# Storage Service

Microserviço para upload e persistência de metadados de arquivos.

## Funcionalidades

- Upload de imagens de usuário/empresa/carga.
- Persistência de metadados no banco.
- Publicação assíncrona de eventos de imagem via outbox.
- Reconciliação periódica entre banco e filesystem.
- Suporte opcional a idempotência via header `Idempotency-Key`.

## Endpoints principais

- `POST /user-images/upload` (form-data, campo `image`, requer auth)
- `POST /company-images/upload` (form-data, campo `image`, requer auth)
- `POST /cargo-images/upload` (form-data, campo `image`, requer auth)

## Segurança e validação

- Rotas mutáveis protegidas por token JWT (ou token interno entre serviços).
- Validação por `mimetype` e assinatura real do arquivo (magic bytes).
- Limite de upload de 5MB.
