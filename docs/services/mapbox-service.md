# mapbox-service

## Resumo

Microsserviço **stateless** que faz proxy para a API Mapbox: rotas de frete, geocoding direto e reverso. O token secreto fica apenas no servidor; clientes chamam via gateway.

## Responsabilidades

- Calcular rota para frete (`rota-frete`)
- Geocoding forward e reverse
- Health check
- Isolar `MAPBOX_SECRET_TOKEN` do frontend

## Stack e dependências

- Express 5, axios (chamadas à API Mapbox)
- Sem Sequelize / MySQL

## Estrutura de pastas

```text
mapbox-service/src/
├── index.ts
├── routes/mapBox.routes.ts
├── controllers/mapBox.controller.ts
├── services/
└── schemas/
```

## Integrações

| Destino | Uso |
|---------|-----|
| API Mapbox (HTTPS) | Rotas e geocoding |

**Chamado por:** portal empresa e app motorista via `/api/mapbox/*`.

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3004 |
| Prefixo Nginx | `/api/mapbox/` → repassa para `/api/` no serviço |
| Banco MySQL | — |

## API / rotas principais

Rotas internas (prefixo `/api` no serviço):

| Método | Rota interna | Via gateway (exemplo) | Descrição |
|--------|--------------|------------------------|-----------|
| GET | `/api/rota-frete` | `/api/mapbox/rota-frete` | Rota entre pontos do frete |
| GET | `/api/geocode-forward` | `/api/mapbox/geocode-forward` | Endereço → coordenadas |
| GET | `/api/geocode-reverse` | `/api/mapbox/geocode-reverse` | Coordenadas → endereço |
| GET | `/health` | — (interno) | Health |

Parâmetros de query validados com Zod nos controllers.

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Não | Default 3004 |
| `MAPBOX_SECRET_TOKEN` | Sim | Token server-side Mapbox |
| `MAPBOX_ALLOW_SELF_SIGNED_TLS` | Não | `true` apenas em dev |

Ver [`.env.example`](../../mapbox-service/.env.example).

## Como executar

```bash
cd mapbox-service
npm install && npm run dev
```

Docker: build isolado em `./mapbox-service` (não copia rpc-contracts).

## Convenções do código

- Nunca logar o token Mapbox.
- Manter timeouts razoáveis nas chamadas axios à Mapbox.
- Alinhar paths com clientes: app usa `mapbox/rota-frete` relativo ao `ENV_BASE_URL`.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [freight-service.md](freight-service.md)

## Referências no repositório

- `mapbox-service/src/routes/mapBox.routes.ts`
- `nginx/conf.d/app.conf` (bloco `location /api/mapbox/`)
