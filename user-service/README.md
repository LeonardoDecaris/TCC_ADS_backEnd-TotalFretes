# Microserviço de Usuário (Caminhoneiro)

Microserviço responsável pelo cadastro e gestão de **motoristas/caminhoneiros**: dados pessoais, CNH, veículos e tipos de veículo. Não armazena credenciais de login — isso fica no `authentication-service`.

**Porta padrão:** `3001`

## Responsabilidades

- CRUD de usuários (motoristas)
- Cadastro completo com criação de conta no auth (`/user/end-account`)
- Gestão de CNH, veículos e tipos de veículo
- Integração com `authentication-service` (validação de token) e `storage-service` (imagens)

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/health` | Não | Health check |
| `GET` | `/api-docs` | Não | Spec OpenAPI (JSON) |

### `/user`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/user` | Não | — | Cria usuário (motorista) |
| `POST` | `/user/end-account` | Não | — | Cria usuário + conta no auth |
| `GET` | `/user` | Sim | ADMIN | Lista todos os usuários |
| `GET` | `/user/:id` | Sim | owner/COMPANY | Busca usuário por ID |
| `PATCH` | `/user/:id` | Sim | owner | Atualização parcial |
| `PUT` | `/user/:id` | Sim | owner | Atualização completa |
| `DELETE` | `/user/:id` | Sim | owner | Remove usuário |

### `/vehicle`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/vehicle` | Sim | — | Cria veículo |
| `POST` | `/vehicle/register` | Sim | — | Cria veículo e vincula ao usuário |
| `GET` | `/vehicle` | Sim | ADMIN | Lista veículos |
| `GET` | `/vehicle/:id` | Sim | ADMIN, USER, COMPANY | Busca veículo por ID |
| `PUT` | `/vehicle/:id` | Sim | ADMIN, USER | Atualiza veículo |
| `DELETE` | `/vehicle/:id` | Sim | ADMIN, USER | Remove veículo |

### `/vehicle-type`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/vehicle-type` | Sim | ADMIN | Cria tipo de veículo |
| `GET` | `/vehicle-type` | Sim | — | Lista tipos de veículo |
| `GET` | `/vehicle-type/:id` | Sim | — | Busca tipo por ID |
| `PUT` | `/vehicle-type/:id` | Sim | ADMIN | Atualiza tipo |
| `DELETE` | `/vehicle-type/:id` | Sim | ADMIN | Remove tipo |

### `/group-vehicle-type`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/group-vehicle-type` | Sim | ADMIN | Cria grupo de tipo |
| `GET` | `/group-vehicle-type` | Sim | — | Lista grupos |
| `GET` | `/group-vehicle-type/:id` | Sim | — | Busca grupo por ID |
| `PUT` | `/group-vehicle-type/:id` | Sim | ADMIN | Atualiza grupo |
| `DELETE` | `/group-vehicle-type/:id` | Sim | ADMIN | Remove grupo |

### `/cnh` (tipos de CNH)

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/cnh` | Sim | ADMIN | Cria tipo de CNH |
| `GET` | `/cnh` | Sim | ADMIN | Lista tipos de CNH |
| `GET` | `/cnh/:id` | Sim | ADMIN | Busca tipo por ID |
| `PUT` | `/cnh/:id` | Sim | ADMIN | Atualiza tipo |
| `DELETE` | `/cnh/:id` | Sim | ADMIN | Remove tipo |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
JWT_SECRET=secret
PORT=3001

DB_NAME=authentication_service
DB_USER=root
DB_PASS=123456
DB_HOST=authentication-service-database

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=authentication_service
MYSQL_ROOT_HOST=%

AUTH_SERVICE_URL=http://authentication-service:3000
STORAGE_SERVICE_URL=http://storage-service:3007

REDIS_URL=redis://redis:6379
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service` para validar tokens. |
| `DB_*` | Sim | Conexão com o banco MySQL do serviço. |
| `AUTH_SERVICE_URL` | Sim | URL do serviço de autenticação. |
| `STORAGE_SERVICE_URL` | Não | URL do storage-service para imagens de perfil. |
