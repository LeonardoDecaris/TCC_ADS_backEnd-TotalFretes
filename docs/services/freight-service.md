# freight-service

## Resumo

Microsserviço de **fretes e propostas**: publicação de cargas por empresas, candidaturas de motoristas, aceite/rejeição e ciclo de vida do frete (cancelar, concluir). Catálogos auxiliares de tipo de carga e status.

## Responsabilidades

- CRUD de fretes (empresa cria; motorista/empresa atualizam conforme regra)
- Propostas de motoristas para fretes
- Tipos de carga, status de frete e status de proposta
- Seeds de dados de teste (opcional no startup)
- Resumo de propostas para dashboard da empresa

## Stack e dependências

- Express 5, Sequelize, MySQL, Zod, jsonwebtoken
- axios → `I18N_SERVICE_URL` (mensagens traduzidas)

## Estrutura de pastas

```text
freight-service/src/
├── routes/
│   ├── freight.routes.ts
│   ├── proposals.routes.ts
│   ├── cargoTypes.routes.ts
│   ├── freightStatusTypes.routes.ts
│   └── proposalsStatusTypes.routes.ts
├── controllers/, models/, schemas/, middleware/
├── scripts/runTestSeed.ts
└── api-docs.ts
```

## Integrações

| Destino | Uso |
|---------|-----|
| i18n-translation-service | Mensagens de erro/resposta |

**Chamado por:** portal empresa e app motorista (`/api/freight`, `/api/proposal`, catálogos).

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3008 |
| Prefixo Nginx | `/api/freight`, `/api/freight/`, `/api/proposal`, `/api/cargo-type`, `/api/freight-status-type`, `/api/proposal-status-type` |
| MySQL (host) | **3310** |

## API / rotas principais

### Freight (`/freight`)

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| POST | `/` | COMPANY | Cria frete |
| GET | `/` | Auth | Lista fretes (filtros no controller) |
| GET | `/:id` | Auth | Detalhe |
| GET | `/user/:id` | Auth | Fretes do motorista |
| PUT | `/:id` | COMPANY, USER | Atualiza |
| PATCH | `/:id/cancel` | COMPANY, USER | Cancela |
| PATCH | `/:id/complete` | COMPANY | Conclui |
| DELETE | `/:id` | COMPANY | Remove |

### Proposal (`/proposal`)

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| POST | `/` | USER | Motorista cria proposta |
| GET | `/` | Auth | Lista propostas |
| GET | `/freight-summary` | COMPANY, ADMIN | Resumo para dashboard |
| GET | `/:id` | Auth | Detalhe |
| PUT | `/:id` | USER | Atualiza proposta |
| DELETE | `/:id` | USER | Remove |
| PATCH | `/:id/accept` | COMPANY | Empresa aceita |
| PATCH | `/:id/reject` | COMPANY | Empresa rejeita |
| PATCH | `/:id/confirm-driver` | USER | Motorista confirma |
| PATCH | `/:id/decline-driver` | USER | Motorista desiste |

### Catálogos

| Prefixo | Gestão típica |
|---------|----------------|
| `/cargo-type` | COMPANY (CRUD próprio) |
| `/freight-status-type` | ADMIN |
| `/proposal-status-type` | ADMIN |

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Sim | Porta HTTP |
| `JWT_SECRET` | Sim | Validação JWT |
| `DB_*` | Sim | MySQL |
| `I18N_SERVICE_URL` | Não | i18n |
| `SEED_TEST_DATA` | Não | `true` para seed no startup |
| `SEED_TEST_COMPANY_ID` | Não | Id empresa para seed |
| `SEED_TEST_DRIVER_IDS` | Não | Ids motoristas (vírgula) |

Ver [`.env.example`](../../freight-service/.env.example) e [`freight-service/scripts/README.md`](../../freight-service/scripts/README.md).

## Como executar

```bash
cd freight-service
npm install && npm run dev
```

Seed manual: `npm run seed:test`.

## Convenções do código

- Regras de status devem respeitar transições no controller/service, não só na rota.
- Novos endpoints: atualizar `api-docs.ts` para o swagger-service agregar.
- Testes locais com MySQL Docker: `DB_HOST=127.0.0.1`, `DB_PORT=3310`.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [company-service.md](company-service.md)
- [user-service.md](user-service.md)

## Referências no repositório

- `freight-service/src/routes/freight.routes.ts`
- `freight-service/src/routes/proposals.routes.ts`
