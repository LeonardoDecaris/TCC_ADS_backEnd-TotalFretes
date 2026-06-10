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
# Servidor
PORT=3007
NODE_ENV=development
SERVICE_NAME=storage-service

# Banco de dados (MySQL)
DB_HOST=storage-service-database
DB_NAME=storage_db
DB_USER=storage_user
DB_PASS=storage_pass
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=storage_db
MYSQL_ROOT_HOST=%

# Armazenamento de arquivos
UPLOAD_DIR=/app/uploads
BACKUP_UPLOAD_DIR=/backup/uploads
PUBLIC_IMAGE_KINDS=user,company,cargo

# Autenticação
JWT_SECRET=sua_chave_secreta_jwt_compartilhada_entre_os_servicos
INTERNAL_SERVICE_TOKEN=token_interno_entre_servicos

# Mensageria (eventos de imagem)
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
STORAGE_EVENTS_EXCHANGE=storage.events
STORAGE_EVENTS_ROUTING_KEY_PREFIX=storage.image

# Jobs em background
IMAGE_OUTBOX_PUBLISH_INTERVAL_MS=3000
STORAGE_RECONCILIATION_INTERVAL_MS=300000
ORPHAN_FILE_RETENTION_HOURS=24
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Metadados das imagens no MySQL. |
| `UPLOAD_DIR` | Não | Diretório de uploads (volume Docker em produção). |
| `INTERNAL_SERVICE_TOKEN` | Não | Token para chamadas internas entre serviços. |
| `RABBITMQ_URL` | Não | Publica eventos quando imagens são criadas/atualizadas. |
| `STORAGE_*` / `IMAGE_*` / `ORPHAN_*` | Não | Configuração de filas e jobs; padrões funcionam no Docker. |
