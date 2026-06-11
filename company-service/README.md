# Microserviço de Empresa

Microserviço responsável pelo cadastro e gestão de **empresas contratantes**: dados cadastrais, endereços, imagem de perfil e fluxo de pagamento/ativação. Não armazena credenciais de login — isso fica no `authentication-service`.

**Porta padrão:** `3002`

## Responsabilidades

- CRUD de empresas
- Cadastro completo com criação de conta no auth (`/company/end-account`)
- Gestão de endereços (`/address`)
- Upload de imagem da empresa
- Fluxo de token de pagamento e ativação da conta
- Consultas internas de status de pagamento para outros serviços

## Endpoints

> Rotas marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Mensagem de status do serviço |
| `GET` | `/health` | Não | Health check |
| `GET` | `/api-docs` | Não | Spec OpenAPI (JSON) |

### `/company`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/company` | Não | — | Cria empresa |
| `POST` | `/company/end-account` | Não | — | Cria empresa + conta no auth |
| `POST` | `/company/payment-token/request` | Não | — | Solicita token de pagamento |
| `PATCH` | `/company/complete-payment` | Token* | — | Conclui pagamento (token de pagamento) |
| `GET` | `/company/internal/:subjectId/payment-status` | Interno** | — | Status de pagamento (serviço-a-serviço) |
| `GET` | `/company` | Sim | ADMIN | Lista empresas |
| `GET` | `/company/:id` | Sim | owner/USER | Busca empresa por ID |
| `PUT` | `/company/:id` | Sim | owner | Atualiza empresa |
| `DELETE` | `/company/:id` | Sim | owner | Remove empresa |
| `DELETE` | `/company/me` | Sim | COMPANY | Remove própria empresa |
| `POST` | `/company/:id/image` | Sim | owner | Upload de imagem (form-data `image`) |
| `DELETE` | `/company/:id/image` | Sim | owner | Remove imagem |

\* Header/token específico de pagamento, não JWT.  
\** Requer `INTERNAL_SERVICE_KEY`.

### `/address`

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/address` | Sim | COMPANY | Cria endereço |
| `GET` | `/address` | Sim | COMPANY, ADMIN | Lista endereços |
| `GET` | `/address/:id` | Sim | COMPANY, ADMIN | Busca endereço por ID |
| `PUT` | `/address/:id` | Sim | COMPANY, ADMIN | Atualiza endereço |
| `DELETE` | `/address/:id` | Sim | COMPANY, ADMIN | Remove endereço |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
JWT_SECRET=secret
PORT=3002

DB_NAME=authentication_service
DB_USER=root
DB_PASS=123456
DB_HOST=authentication-service-database

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=authentication_service
MYSQL_ROOT_HOST=%

AUTH_SERVICE_URL=http://authentication-service:3000/
STORAGE_SERVICE_URL=http://storage-service:3007/
INTERNAL_SERVICE_KEY=dev-internal-service-key
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service` para validar tokens. |
| `DB_*` | Sim | Conexão com o banco MySQL do serviço. |
| `AUTH_SERVICE_URL` | Sim | URL do serviço de autenticação. |
| `STORAGE_SERVICE_URL` | Não | URL do storage-service para imagens. |
| `FREIGHT_SERVICE_URL` | Não | URL do freight-service para enriquecimento de dados. |
| `INTERNAL_SERVICE_KEY` | Não | Chave para rotas internas (`/company/internal/...`). |
| `COMPANY_SEED_*` | Não | Cria empresa de teste na inicialização (útil em dev). |
