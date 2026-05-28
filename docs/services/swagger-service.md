# swagger-service

## Resumo

Microsserviço de **documentação API agregada**: busca specs OpenAPI de cada serviço de domínio, mescla em um documento central e expõe Swagger UI atrás do Nginx.

## Responsabilidades

- Fetch periódico/on-demand de `/api-docs` dos MS
- UI Swagger unificada (`/swagger-ui`, `/docs`)
- Proxy opcional para specs individuais
- Health check

## Stack e dependências

- Express 4, swagger-ui-express, axios, http-proxy-middleware
- Sem banco de dados

## Estrutura de pastas

```text
swagger-service/
├── index.ts          # App único na raiz do serviço
├── Dockerfile
└── .env.example
```

## Integrações

| Destino | URL interna (default) | Spec |
|---------|----------------------|------|
| authentication-service | `:3000/api-docs` | OpenAPI |
| user-service | `:3001/api-docs` | OpenAPI |
| company-service | `:3002/api-docs` | OpenAPI |
| storage-service | `:3007/api-docs` | OpenAPI |
| freight-service | `:3008/api-docs` | OpenAPI |

Variáveis `*_SERVICE_URL` sobrescrevem hosts.

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3005 |
| Prefixo Nginx | `/api-docs/`, `/swagger-ui`, `/docs` |
| Banco MySQL | — |

## API / rotas principais

| Rota | Descrição |
|------|-----------|
| `GET /docs` | Spec OpenAPI mesclada (JSON) |
| `GET /health` | Health do agregador |
| `/swagger-ui/*` | Interface Swagger UI |
| Proxy | Encaminha para specs dos MS conforme config |

Servidor documentado no spec agregado: `url: /api` (gateway Nginx).

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Não | Default 3005 |
| `AUTH_SERVICE_URL` | Não | Base auth |
| `USER_SERVICE_URL` | Não | Base user |
| `COMPANY_SERVICE_URL` | Não | Base company |
| `STORAGE_SERVICE_URL` | Não | Base storage |
| `FREIGHT_SERVICE_URL` | Não | Base freight |

Ver [`.env.example`](../../swagger-service/.env.example).

## Como executar

```bash
cd swagger-service
npm install && npm run dev
```

Acesse via gateway: http://localhost/swagger-ui (após `docker compose up`).

## Convenções do código

- Ao adicionar rotas em um MS, atualizar `api-docs.ts` daquele serviço; o swagger-service não define paths manualmente.
- Falha ao buscar um spec: log de warning; agregação segue com os demais.
- Não expor swagger em produção sem controle de acesso, se aplicável ao deploy final.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- Todos os `docs/services/*.md` com `api-docs.ts`

## Referências no repositório

- `swagger-service/index.ts`
- `nginx/conf.d/app.conf` (rotas `/api-docs`, `/swagger-ui`)
