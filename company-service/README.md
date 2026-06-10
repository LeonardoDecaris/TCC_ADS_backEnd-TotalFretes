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
# Servidor
PORT=3002
JWT_SECRET=sua_chave_secreta_jwt_compartilhada_entre_os_servicos
NODE_ENV=development
SERVICE_NAME=company-service

# Banco de dados (MySQL)
DB_HOST=company-service-database
DB_NAME=company_db
DB_USER=company_user
DB_PASS=company_pass
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=company_db
MYSQL_ROOT_HOST=%

# Integração com outros serviços
AUTH_SERVICE_URL=http://authentication-service:3000
STORAGE_SERVICE_URL=http://storage-service:3007
FREIGHT_SERVICE_URL=http://freight-service:3008
INTERNAL_SERVICE_KEY=chave_interna_entre_servicos

# Seed opcional de empresa (desenvolvimento)
COMPANY_SEED_ENABLED=true
COMPANY_SEED_EMAIL=empresa@totalfretes.com
COMPANY_SEED_PASSWORD=Empresa@123
COMPANY_SEED_CNPJ=12345678000199
COMPANY_SEED_NAME=Empresa Teste LTDA
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
