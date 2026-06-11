# Microserviço de Notificações

Microserviço responsável por **persistir e entregar notificações in-app** para motoristas e empresas. Consome eventos publicados pelo `freight-service` via RabbitMQ e expõe API REST para consulta e marcação como lida.

**Porta padrão:** `3006`

## Responsabilidades

- Consumir fila RabbitMQ de notificações
- Persistir notificações no banco MySQL
- API para listar notificações não lidas por usuário
- Marcar notificação como lida
- Push em tempo real via cliente HTTP interno (quando configurado)

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/health` | Não | Health check |

### `/notifications`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `GET` | `/notifications/:userId` | Sim | owner/ADMIN | Lista notificações não lidas do usuário |
| `PATCH` | `/notifications/:id/read` | Sim | — | Marca notificação como lida |

> O consumo da fila RabbitMQ não expõe endpoint HTTP — é processado em background pelo consumer do serviço.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Servidor
PORT=3006
JWT_SECRET=secret
JWT_EXPIRES_IN=1d
SERVICE_NAME=notification-service
LOKI_HOST=http://loki:3100/
LOG_LEVEL=info
NODE_ENV=development

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
NOTIFICATIONS_QUEUE=notifications.queue
NOTIFICATIONS_DLX=notifications.dlx
NOTIFICATIONS_FAILED_QUEUE=notifications.failed
NOTIFICATIONS_EXCHANGE=notifications.events
NOTIFICATIONS_ROUTING_KEY=notification.send

DB_HOST=notification-service-database
DB_PORT=3306
DB_NAME=notification_service
DB_USER=root
DB_PASS=123456

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=notification_service
MYSQL_ROOT_HOST=%

REDIS_URL=redis://redis:6379
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Conexão com o banco MySQL do serviço. |
| `RABBITMQ_URL` | Sim | Consome fila publicada pelo `freight-service`. |
| `NOTIFICATIONS_*` | Não | Nomes das filas/exchanges; padrões já funcionam no Docker. |
| `REDIS_URL` | Não | Cache opcional. |
