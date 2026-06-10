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
JWT_SECRET=sua_chave_secreta_jwt_compartilhada_entre_os_servicos
JWT_EXPIRES_IN=24h
NODE_ENV=development
SERVICE_NAME=notification-service
LOG_LEVEL=info

# Banco de dados (MySQL)
DB_HOST=notification-service-database
DB_PORT=3306
DB_NAME=notification_db
DB_USER=notification_user
DB_PASS=notification_pass
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=notification_db
MYSQL_ROOT_HOST=%

# Mensageria
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
NOTIFICATIONS_EXCHANGE=notifications.events
NOTIFICATIONS_QUEUE=notifications.queue
NOTIFICATIONS_ROUTING_KEY=notification.send
NOTIFICATIONS_DLX=notifications.dlx
NOTIFICATIONS_FAILED_QUEUE=notifications.failed

# Cache (opcional)
REDIS_URL=redis://redis:6379
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Conexão com o banco MySQL do serviço. |
| `RABBITMQ_URL` | Sim | Consome fila publicada pelo `freight-service`. |
| `NOTIFICATIONS_*` | Não | Nomes das filas/exchanges; padrões já funcionam no Docker. |
| `REDIS_URL` | Não | Cache opcional. |
