# authentication-service

## Resumo

Microsserviço de **credenciais e autenticação**. Centraliza contas (`ACCOUNTS`), login, emissão de JWT e fluxo de recuperação de senha. As senhas não ficam em `user-service` nem `company-service`.

## Responsabilidades

- Login e validação de token
- CRUD de contas (`/account`)
- Alteração de senha autenticada
- Esqueci senha: código no Redis + fila RabbitMQ para e-mail
- Health check com status de MySQL e Redis

## Stack e dependências

- Express 5, Sequelize, MySQL, bcrypt, jsonwebtoken
- ioredis, amqplib, `@total-fretes/rpc-contracts`
- Zod para validação de payloads

## Estrutura de pastas

```text
authentication-service/src/
├── index.ts, app.ts
├── routes/          auth.routes.ts, account.routes.ts
├── controllers/
├── models/          ACCOUNTS, ACCOUNT_TYPES, ACCOUNT_STATUS_TYPES
├── middleware/      authMiddleware.ts
├── messaging/       publicação AMQP
├── lib/redisClient.ts
├── config/database.ts
└── api-docs.ts
```

## Integrações

| Destino | Protocolo | Uso |
|---------|-----------|-----|
| MySQL | TCP | Persistência de contas |
| Redis | TCP | Código de reset (TTL 15 min) |
| RabbitMQ | AMQP | Enfileirar e-mail de reset |
| i18n-translation-service | HTTP | Mensagens (opcional) |

**Chamado por:** todos os clientes via Nginx; outros MS raramente chamam HTTP (validação local por JWT).

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3000 |
| Prefixo Nginx | `/api/auth`, `/api/account` |
| Banco MySQL (Docker host) | porta **3306** |

## API / rotas principais

Rotas internas montadas em `/auth` e `/account`. Via gateway: `/api/auth/*`, `/api/account/*`.

### Auth (`/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/login` | Login; retorna JWT (`id`=subject_id, `role`) |
| POST | `/validate` | Valida token; retorna `{ valid, user: { id, role } }` |
| GET | `/verify-token` | Verifica token (Bearer); requer auth |
| PATCH | `/change-password` | Troca senha autenticada |
| POST | `/forgot-password` | Gera código e enfileira e-mail |
| POST | `/validate-code` | Valida código de reset |
| POST | `/reset-password` | Redefine senha com código |
| POST | `/resend-code` | Reenvia código |
| GET | `/health` | Health (DB + Redis) |

### Account (`/account`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Cria conta |
| GET | `/types` | Tipos de conta |
| GET | `/:id` | Conta por id (ADMIN) |
| DELETE | `/:id` | Remove conta (ADMIN) |
| DELETE | `/subject/:id` | Remove por subject_id (dono ou ADMIN) |

### Roles no JWT

| Role | Público |
|------|---------|
| `usuario` / `USER` | Motorista |
| `empresa` / `COMPANY` | Empresa |
| `admin` / `ADMIN` | Administrador |

## Modelo de dados (resumo)

- **ACCOUNTS:** email, password (bcrypt), account_type_id, subject_id, status_id
- **ACCOUNT_TYPES:** `USER`, `COMPANY`, `ADMIN`
- **ACCOUNT_STATUS_TYPES:** `ACTIVE`, `BLOCKED`, `DISABLED`

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Sim | Porta HTTP |
| `JWT_SECRET` | Sim | Assinatura do token |
| `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST` | Sim | MySQL |
| `REDIS_URL` | Sim (reset) | Redis |
| `RABBITMQ_URL` | Sim (reset) | RabbitMQ |
| `EMAIL_EVENTS_EXCHANGE` | Não | Default `email.events` |
| `EMAIL_SEND_QUEUE` | Não | Default `email.send` |
| `I18N_SERVICE_URL` | Não | Traduções |

Ver [`.env.example`](../../authentication-service/.env.example).

## Como executar

```bash
cd authentication-service
npm install && npm run dev
```

Testes: `npm test`. Docker: via `docker compose` na raiz.

## Convenções do código

- Novos endpoints de auth: atualizar `auth.routes.ts`, controller, schema Zod e `api-docs.ts`.
- Reset de senha: sempre Redis + fila; não chamar SMTP diretamente.
- `POST /auth/validate` é contrato estável para integradores externos.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [email-management-service.md](email-management-service.md)
- Portal empresa / App motorista (clientes JWT)

## Referências no repositório

- `authentication-service/src/routes/auth.routes.ts`
- `authentication-service/README.md` (detalhes legados de contrato `/auth/validate`)
