# email-management-service

## Resumo

Microsserviço **assíncrono de e-mail**: consome filas RabbitMQ publicadas pelo `authentication-service` (reset de senha) e envia mensagens via SMTP (Nodemailer). Quase não expõe API HTTP além de health.

## Responsabilidades

- Consumir fila de envio de e-mail (`password_reset`)
- Enviar e-mail com código de redefinição
- Health check HTTP
- Topologia AMQP (exchange, filas, DLX) via `@total-fretes/rpc-contracts`

## Stack e dependências

- Express 5 (mínimo), amqplib, nodemailer
- `@total-fretes/rpc-contracts` (`passwordResetEmailMessageSchema`, topologia)

## Estrutura de pastas

```text
email-management-service/src/
├── index.ts
├── messaging/
│   ├── email.consumer.ts
│   └── email.amqp.ts
└── services/passwordResetMail.ts
```

## Integrações

| Origem | Protocolo | Uso |
|--------|-----------|-----|
| authentication-service | AMQP publish | Jobs de reset de senha |
| SMTP | TCP | Envio real do e-mail |

**Nginx:** apenas `GET /api/email/health` permitido; POST bloqueado no gateway.

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3003 |
| Prefixo Nginx | `/api/email/` (health only) |
| Banco MySQL | — |

## API / rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Retorna `OK` |

Não há API REST para disparar e-mail; use fila RabbitMQ.

## Mensageria

| Variável (defaults em rpc-contracts) | Função |
|--------------------------------------|--------|
| `EMAIL_EVENTS_EXCHANGE` | Exchange de eventos |
| `EMAIL_SEND_QUEUE` | Fila de envio |
| `EMAIL_ROUTING_KEY_PASSWORD_RESET` | Routing key reset |
| `EMAIL_DLX_EXCHANGE` / `EMAIL_SEND_FAILED_QUEUE` | Dead-letter |

Payload validado: `{ email, codigo, type: 'password_reset' }`.

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Não | Default 3003 |
| `RABBITMQ_URL` | Sim | Conexão AMQP |
| `SMTP_HOST`, `SMTP_PORT` | Sim | Servidor SMTP |
| `SMTP_USER`, `SMTP_PASS` | Sim | Credenciais |
| `SMTP_FROM` | Sim | Remetente |
| `SMTP_SECURE` | Não | TLS |

Ver [`.env.example`](../../email-management-service/.env.example).

## Como executar

```bash
cd email-management-service
npm install && npm run dev
```

Requer RabbitMQ ativo (Docker Compose). No compose, `RABBITMQ_URL` aponta para `rabbitmq:5672`.

## Convenções do código

- Mensagens inválidas: `ack` sem reprocessar (evitar loop).
- Falha de SMTP: `nack` para DLX conforme topologia.
- Não adicionar endpoints HTTP de envio; manter padrão event-driven.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [authentication-service.md](authentication-service.md)
- [packages/rpc-contracts](../../packages/rpc-contracts)

## Referências no repositório

- `email-management-service/src/messaging/email.consumer.ts`
- `email-management-service/src/index.ts`
