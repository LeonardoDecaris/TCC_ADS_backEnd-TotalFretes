# company-service

## Resumo

Microsserviço da **empresa contratante**: cadastro, dados cadastrais, endereços e imagem de perfil. Credenciais ficam no `authentication-service` (`subject_id` = id da empresa aqui).

## Responsabilidades

- CRUD de empresa
- Endereços vinculados à empresa
- Upload/remoção de imagem da empresa (multer local + integração storage)
- Encerramento de conta (`/company/end-account`, `/company/me`)
- Listagem administrativa (ADMIN)

## Stack e dependências

- Express 5, Sequelize, MySQL, Zod, jsonwebtoken, multer
- axios → `AUTH_SERVICE_URL`, `STORAGE_SERVICE_URL`, `I18N_SERVICE_URL`

## Estrutura de pastas

```text
company-service/src/
├── routes/
│   ├── company.routes.ts
│   └── address.routes.ts
├── controllers/, models/, schemas/, middleware/
├── utils/uploadCompanyImage.ts
└── api-docs.ts
```

## Integrações

| Destino | Uso |
|---------|-----|
| authentication-service | Criação/remoção de conta |
| storage-service | Persistência de imagens |
| i18n-translation-service | Mensagens de erro |

**Chamado por:** portal web empresa (`/api/company`, `/api/address`).

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3002 |
| Prefixo Nginx | `/api/company`, `/api/address` |
| MySQL (host) | **3308** |

## API / rotas principais

### Company (`/company`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/` | — | Cria empresa |
| POST | `/end-account` | — | Fluxo de encerramento |
| DELETE | `/me` | COMPANY | Remove própria empresa |
| GET | `/:id` | Sim | Busca por id (dono ou roles) |
| GET | `/` | ADMIN | Lista todas |
| PUT | `/:id` | Sim | Atualiza (dono) |
| DELETE | `/:id` | Sim | Remove (dono) |
| POST | `/:id/image` | Sim | Upload imagem (multipart `image`) |
| DELETE | `/:id/image` | Sim | Remove imagem |

### Address (`/address`)

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| POST | `/` | COMPANY | Cria endereço |
| GET | `/`, `/:id` | COMPANY, ADMIN | Lista / detalhe |
| PUT | `/:id` | COMPANY, ADMIN | Atualiza |
| DELETE | `/:id` | COMPANY, ADMIN | Remove |

Via gateway: `/api/company/*`, `/api/address/*`.

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Sim | Porta HTTP |
| `JWT_SECRET` | Sim | Validação local do JWT |
| `DB_*` | Sim | MySQL |
| `AUTH_SERVICE_URL` | Sim | Integração com auth |
| `STORAGE_SERVICE_URL` | Sim | Upload de imagens |
| `I18N_SERVICE_URL` | Não | i18n |

Ver [`.env.example`](../../company-service/.env.example).

## Como executar

```bash
cd company-service
npm install && npm run dev
```

Docker: via `docker compose` na raiz.

## Convenções do código

- `authMiddleware` + `authorizeRoles('COMPANY'|'ADMIN')` ou `allowOwnerOrRoles()`.
- `subject_id` do JWT deve corresponder ao `company.id` para operações da empresa logada.
- Erros de upload: middleware `handleCompanyImageUploadError`.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [authentication-service.md](authentication-service.md)
- [storage-service.md](storage-service.md)
- Repositório cliente: `../TCC_ADS_TotalFretesEmpresa` (portal web empresa)

## Referências no repositório

- `company-service/src/routes/company.routes.ts`
- `company-service/src/routes/address.routes.ts`
