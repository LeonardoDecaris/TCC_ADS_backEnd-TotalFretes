# Storage Service

Microserviço para **upload e persistência de metadados de arquivos** (imagens de usuário, empresa e carga).

**Porta padrão:** `3007`

## Funcionalidades

- Upload de imagens de usuário/empresa/carga.
- Persistência de metadados no banco.
- Publicação assíncrona de eventos de imagem via outbox.
- Reconciliação periódica entre banco e filesystem.
- Suporte opcional a idempotência via header `Idempotency-Key`.

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`. Uploads usam `multipart/form-data` com campo `image`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/health` | Não | Health check |
| `GET` | `/api-docs` | Não | Spec OpenAPI (JSON) |
| `GET` | `/uploads/user-images/*` | Não | Arquivos estáticos de imagens de usuário |
| `GET` | `/uploads/company-images/*` | Não | Arquivos estáticos de imagens de empresa |
| `GET` | `/uploads/cargo-images/*` | Não | Arquivos estáticos de imagens de carga |

### `/user-images`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/user-images/upload` | Sim | USER, ADMIN | Upload de imagem |
| `GET` | `/user-images` | Sim | ADMIN | Lista metadados |
| `GET` | `/user-images/:id` | Não | — | Busca imagem por ID |
| `PUT` | `/user-images/:id` | Sim | USER, ADMIN | Atualiza imagem |
| `DELETE` | `/user-images/:id` | Sim | USER, ADMIN | Remove imagem |

### `/company-images`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/company-images/upload` | Sim | COMPANY, ADMIN | Upload de imagem |
| `GET` | `/company-images` | Sim | ADMIN | Lista metadados |
| `GET` | `/company-images/:id` | Não | — | Busca imagem por ID |
| `PUT` | `/company-images/:id` | Sim | COMPANY, ADMIN | Atualiza imagem |
| `DELETE` | `/company-images/:id` | Sim | COMPANY, ADMIN | Remove imagem |

### `/cargo-images`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/cargo-images/upload` | Sim | ADMIN | Upload de imagem |
| `GET` | `/cargo-images` | Sim | ADMIN | Lista metadados |
| `GET` | `/cargo-images/:id` | Não | — | Busca imagem por ID |
| `PUT` | `/cargo-images/:id` | Sim | ADMIN | Atualiza imagem |
| `DELETE` | `/cargo-images/:id` | Sim | ADMIN | Remove imagem |

## Segurança e validação

- Rotas mutáveis protegidas por token JWT (ou token interno entre serviços).
- Validação por `mimetype` e assinatura real do arquivo (magic bytes).
- Limite de upload de 5MB.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
PORT=3007
JWT_SECRET=secret

DB_NAME=authentication_service
DB_USER=root
DB_PASS=123456
DB_HOST=authentication-service-database

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=authentication_service
MYSQL_ROOT_HOST=%

UPLOADS_ROOT=/app/uploads
UPLOAD_DIR=/app/uploads/user-images

INTERNAL_SERVICE_TOKEN=local-internal-shared-token
INTERNAL_SERVICE_KEY=dev-internal-service-key
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Metadados das imagens no MySQL. |
| `UPLOAD_DIR` | Não | Diretório de uploads (volume Docker em produção). |
| `INTERNAL_SERVICE_TOKEN` | Não | Token para chamadas internas entre serviços. |
| `RABBITMQ_URL` | Não | Publica eventos quando imagens são criadas/atualizadas. |
| `STORAGE_*` / `IMAGE_*` / `ORPHAN_*` | Não | Configuração de filas e jobs; padrões funcionam no Docker. |
