# Microserviço de Fretes

Microserviço responsável pelo ciclo de vida de **fretes/cargas**: criação pela empresa, listagem, propostas de motoristas, histórico de status e notificações de eventos (cancelamento, entrega, em trânsito).

**Porta padrão:** `3008`

## Responsabilidades

- CRUD de fretes (`/freight`)
- Propostas de motoristas para cargas (`/proposals`)
- Tipos de carga e status de frete/proposta
- Cache Redis de catálogos (`/cargo-type`, `/freight-status-type`)
- Publicação de eventos de notificação via RabbitMQ
- Enriquecimento de respostas com dados de empresa, motorista e imagens

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/health` | Não | Health check (DB + Redis opcional) |
| `GET` | `/api-docs` | Não | Spec OpenAPI (JSON) |

### `/freight`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/freight` | Sim | COMPANY, ADMIN | Cria frete |
| `GET` | `/freight` | Sim | — | Lista fretes |
| `GET` | `/freight/user/:id` | Sim | — | Fretes por usuário/motorista |
| `GET` | `/freight/:id` | Sim | — | Detalhe do frete |
| `PUT` | `/freight/:id` | Sim | COMPANY, USER | Atualiza frete |
| `PATCH` | `/freight/:id/cancel` | Sim | COMPANY, USER | Cancela frete |
| `PATCH` | `/freight/:id/complete` | Sim | COMPANY | Conclui frete |
| `DELETE` | `/freight/:id` | Sim | COMPANY | Remove frete |

### `/proposal`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/proposal` | Sim | USER | Cria proposta (motorista) |
| `GET` | `/proposal` | Sim | — | Lista propostas |
| `GET` | `/proposal/freight-summary` | Sim | COMPANY, ADMIN | Resumo de propostas por frete |
| `GET` | `/proposal/:id` | Sim | — | Detalhe da proposta |
| `PUT` | `/proposal/:id` | Sim | USER | Atualiza proposta |
| `DELETE` | `/proposal/:id` | Sim | USER | Remove proposta |
| `PATCH` | `/proposal/:id/accept` | Sim | COMPANY | Empresa aceita proposta |
| `PATCH` | `/proposal/:id/reject` | Sim | COMPANY | Empresa rejeita proposta |
| `PATCH` | `/proposal/:id/confirm-driver` | Sim | USER | Motorista confirma |
| `PATCH` | `/proposal/:id/decline-driver` | Sim | USER | Motorista recusa |

### `/cargo-type`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/cargo-type` | Sim | COMPANY | Cria tipo de carga |
| `GET` | `/cargo-type` | Sim | — | Lista tipos |
| `GET` | `/cargo-type/:id` | Sim | — | Busca por ID |
| `PUT` | `/cargo-type/:id` | Sim | COMPANY | Atualiza tipo |
| `DELETE` | `/cargo-type/:id` | Sim | COMPANY | Remove tipo |

### `/freight-status-type`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/freight-status-type` | Sim | ADMIN | Cria status de frete |
| `GET` | `/freight-status-type` | Sim | — | Lista status |
| `GET` | `/freight-status-type/:id` | Sim | — | Busca por ID |
| `PUT` | `/freight-status-type/:id` | Sim | ADMIN | Atualiza status |
| `DELETE` | `/freight-status-type/:id` | Sim | ADMIN | Remove status |

### `/proposal-status-type`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/proposal-status-type` | Sim | ADMIN | Cria status de proposta |
| `GET` | `/proposal-status-type` | Sim | — | Lista status |
| `GET` | `/proposal-status-type/:id` | Sim | — | Busca por ID |
| `PUT` | `/proposal-status-type/:id` | Sim | ADMIN | Atualiza status |
| `DELETE` | `/proposal-status-type/:id` | Sim | ADMIN | Remove status |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
JWT_SECRET=secret
PORT=3008

AUTH_SERVICE_URL=http://authentication-service:3000/
STORAGE_SERVICE_URL=http://storage-service:3007/
COMPANY_SERVICE_URL=http://company-service:3002/
USER_SERVICE_URL=http://user-service:3001/
INTERNAL_SERVICE_KEY=dev-internal-service-key

DB_NAME=authentication_service
DB_USER=root
DB_PASS=123456
DB_HOST=authentication-service-database

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=authentication_service
MYSQL_ROOT_HOST=%

INTERNAL_SERVICE_TOKEN=local-internal-shared-token

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
NOTIFICATIONS_QUEUE=notifications.queue
NOTIFICATIONS_DLX=notifications.dlx
NOTIFICATIONS_FAILED_QUEUE=notifications.failed
NOTIFICATIONS_EXCHANGE=notifications.events
NOTIFICATIONS_ROUTING_KEY=notification.send
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Conexão com o banco MySQL do serviço. |
| `REDIS_URL` | Não | Habilita cache das listagens de `/cargo-type` e `/freight-status-type`; sem Redis o serviço funciona sem cache. |
| `RABBITMQ_URL` | Sim | Publica eventos para o `notification-service`. |
| `AUTH_SERVICE_URL` | Sim | Validação de tokens JWT. |
| `USER_SERVICE_URL` / `COMPANY_SERVICE_URL` / `STORAGE_SERVICE_URL` | Não | Enriquecimento de respostas com dados relacionados. |
| `INTERNAL_SERVICE_TOKEN` | Não | Token para chamadas internas entre serviços. |
| `SEED_*` | Não | Popula fretes de teste na inicialização. |
