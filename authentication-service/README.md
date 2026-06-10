# Microserviço de Autenticação

Microserviço responsável por credenciais, login, emissão de JWT e recuperação de senha. As credenciais ficam centralizadas aqui (não no `user-service` e `company-service`).

**Porta padrão:** `3000`

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores abaixo:

```env
# Servidor
PORT=3000
JWT_SECRET=sua_chave_secreta_jwt_compartilhada_entre_os_servicos
NODE_ENV=development
SERVICE_NAME=authentication-service

# Banco de dados (MySQL)
DB_HOST=authentication-service-database
DB_NAME=authentication_db
DB_USER=auth_user
DB_PASS=auth_pass
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=authentication_db
MYSQL_ROOT_HOST=%

# Cache e mensageria (recuperação de senha)
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Filas de e-mail (publicação para email-management-service)
EMAIL_EVENTS_EXCHANGE=email.events
EMAIL_SEND_QUEUE=email.send
EMAIL_ROUTING_KEY_PASSWORD_RESET=email.send.password_reset
EMAIL_DLX_EXCHANGE=email.dlx
EMAIL_SEND_FAILED_QUEUE=email.send.failed

# Integração com company-service (consultas internas)
COMPANY_SERVICE_URL=http://company-service:3002
INTERNAL_SERVICE_KEY=chave_interna_entre_servicos

# Seed opcional de admin (desenvolvimento)
ADMIN_SEED_ENABLED=true
ADMIN_SEED_EMAIL=admin@totalfretes.com
ADMIN_SEED_PASSWORD=Admin@123
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Chave usada para assinar e validar tokens JWT. Deve ser a mesma em todos os microserviços que validam token. |
| `REDIS_URL` | Sim | Armazena códigos de recuperação de senha (TTL 15 min). |
| `RABBITMQ_URL` | Sim | Publica eventos de envio de e-mail na fila consumida pelo `email-management-service`. |
| `COMPANY_SERVICE_URL` | Não | URL do company-service para consultas internas. |
| `INTERNAL_SERVICE_KEY` | Não | Chave compartilhada para chamadas serviço-a-serviço. |
| `ADMIN_SEED_*` | Não | Cria conta admin automaticamente na inicialização (útil em dev). |

> As variáveis `SMTP_*` presentes no `.env.example` legado **não são usadas** por este serviço. O envio de e-mail é feito via RabbitMQ pelo `email-management-service`.

## Modelo de dados

### `ACCOUNTS`

- `id`
- `email` (unique)
- `password` (hash bcrypt)
- `account_type_id` (FK → `ACCOUNT_TYPES`)
- `subject_id` (id da entidade de negócio: USER/COMPANY)
- `status_id` (FK → `ACCOUNT_STATUS_TYPES`)
- `created_at`
- `updated_at`
- `userUpdate_at`

### `ACCOUNT_TYPES`

- `id`
- `name` (`USER`, `COMPANY`, `ADMIN`)
- `created_at`
- `updated_at`
- `userUpdate_at`

### `ACCOUNT_STATUS_TYPES`

- `id`
- `name` (`ACTIVE`, `BLOCKED`, `DISABLED`)
- `created_at`
- `updated_at`
- `userUpdate_at`

> Na inicialização, o serviço garante automaticamente os registros padrão de tipo e status.

## Mensageria e cache (recuperação de senha)

- **Redis** (`REDIS_URL`): armazena o código de redefinição (TTL 15 minutos), permitindo múltiplas instâncias do serviço.
- **RabbitMQ** (`RABBITMQ_URL`): o envio do e-mail é enfileirado; o `email-management-service` consome a fila (não há mais chamada HTTP direta com axios).

Variáveis opcionais (padrões entre parênteses): `EMAIL_EVENTS_EXCHANGE` (`email.events`), `EMAIL_SEND_QUEUE` (`email.send`), `EMAIL_ROUTING_KEY_PASSWORD_RESET` (`email.send.password_reset`), `EMAIL_DLX_EXCHANGE` (`email.dlx`), `EMAIL_SEND_FAILED_QUEUE` (`email.send.failed`).

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/api-docs` | Não | Spec OpenAPI (JSON) |

### `/auth`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/auth/login` | Não | — | Login com e-mail e senha; retorna JWT |
| `POST` | `/auth/validate` | Não* | — | Valida token (header ou body `{ "token" }`) |
| `GET` | `/auth/verify-token` | Sim | — | Decodifica e retorna payload do token |
| `PATCH` | `/auth/change-password` | Sim | — | Altera senha do usuário autenticado |
| `POST` | `/auth/forgot-password` | Não | — | Solicita código de recuperação (envia e-mail via fila) |
| `POST` | `/auth/validate-code` | Não | — | Valida código de recuperação |
| `POST` | `/auth/reset-password` | Não | — | Redefine senha com código válido |
| `POST` | `/auth/resend-code` | Não | — | Reenvia código de recuperação |
| `GET` | `/auth/health` | Não | — | Health check (DB + Redis) |

### `/account`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/account` | Não | — | Cria conta de autenticação |
| `POST` | `/account/admin` | Sim | ADMIN | Cria conta de administrador |
| `GET` | `/account/types` | Não | — | Lista tipos de conta (USER, COMPANY, ADMIN) |
| `GET` | `/account` | Sim | ADMIN | Lista todas as contas |
| `GET` | `/account/subject/:subjectId` | Sim | ADMIN | Busca conta pelo subject_id |
| `GET` | `/account/:id` | Sim | ADMIN | Busca conta por ID |
| `PATCH` | `/account/:id` | Sim | ADMIN | Atualiza conta |
| `DELETE` | `/account/:id` | Sim | ADMIN | Remove conta por ID |
| `DELETE` | `/account/subject/:id` | Sim | owner/admin | Remove conta pelo subject_id |

---

### Detalhes dos endpoints principais

### `POST /auth/login`

Login com `email` e `password`. Retorna JWT com:

- `id`: `subject_id` (id do usuário/empresa no respectivo microserviço)
- `role`: `usuario` | `empresa` | `admin`

### `POST /auth/forgot-password`

Recebe `email`, verifica se existe conta, gera um código numérico de redefinição (6 dígitos), grava no Redis (expira em 15 minutos) e publica o envio do e-mail na fila RabbitMQ (processamento assíncrono no `email-management-service`).

Payload:

```json
{
  "email": "user@dominio.com"
}
```

Response `200`:

```json
{
  "message": "Password reset code sent successfully",
  "expires_in_minutes": 15
}
```

Response `404`:

```json
{
  "message": "Account not found for this email"
}
```

### `POST /auth/validate`

Valida o token e retorna `id` e `role` do usuário. Contrato estável — não alterar campos sem versionar a API.

**Request**

- **Headers**
  - `Authorization: Bearer <token>` (recomendado)
  - `Content-Type: application/json`
- **Body (opcional)**  
  - `{ "token": "<token>" }` — alternativa ao header

**Response 200 — token válido**

```json
{
  "valid": true,
  "user": {
    "id": 123,
    "role": "usuario"
  }
}
```

- `role`: `"usuario"` (caminhoneiro), `"empresa"` ou `"admin"`.

**Response 401 — token inválido ou ausente**

```json
{
  "valid": false,
  "message": "Token inválido ou expirado."
}
```

**Recomendações para clientes**

- Timeout: 3–5 s.
- Em timeout ou 5xx: tratar como indisponibilidade (ex.: retry com backoff ou responder 503).
- Não fazer retry em 401.

---

### `GET /auth/health`

Health check para load balancer e orquestração.

**Response 200**

```json
{
  "status": "up",
  "database": "connected",
  "redis": "connected"
}
```

**Response 503**

```json
{
  "status": "down",
  "database": "disconnected",
  "redis": "disconnected"
}
```

---

## Roles no token

| Role      | Uso na regra de negócio |
|-----------|--------------------------|
| `usuario` | Caminhoneiro             |
| `empresa` | Empresa                  |
| `admin`   | Administrador            |

Os microserviços devem aplicar `authorizeRoles('usuario', 'admin')` ou `authorizeRoles('empresa', 'admin')` conforme a rota, após obter `user` via `POST /auth/validate`.
