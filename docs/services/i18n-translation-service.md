# i18n-translation-service

## Resumo

Microsserviço de **traduções estáticas**: serve arquivos JSON por locale e serviço de origem, expõe metadados para cache e endpoint interno de tradução. Usado pelos demais MS e pelos frontends via gateway.

## Responsabilidades

- Servir JSONs em `i18n/{locale}/*.json` (ex.: `pt-BR`, `en`)
- `GET /i18n/meta` — metadados (mtime, size) para invalidação de cache
- `POST /internal/translate` — tradução interna entre serviços
- Health check

## Stack e dependências

- Express 5, fs/path (sem banco)
- Arquivos versionados em `i18n-translation-service/i18n/`

## Estrutura de pastas

```text
i18n-translation-service/
├── src/server.ts
├── src/controllers/internalTranslate.controller.ts
└── i18n/
    ├── pt-BR/
    │   ├── authentication-service.json
    │   ├── user-service.json
    │   └── ...
    └── en/
```

## Integrações

| Origem | Uso |
|--------|-----|
| authentication, user, company, freight, storage | `I18N_SERVICE_URL` para mensagens de erro |
| Frontends | Carregam JSON via `/api/i18n-translation/` |

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3006 |
| Porta exposta no host | **3006** (único MS exposto direto no compose) |
| Prefixo Nginx | `/api/i18n-translation/` → `/i18n/` no serviço |
| Banco MySQL | — |

## API / rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | `{ ok: true }` |
| GET | `/i18n/meta` | Metadados por locale/arquivo |
| GET | `/i18n/{locale}/{arquivo}.json` | Arquivo estático |
| POST | `/internal/translate` | Tradução server-to-server |

Exemplo público via gateway: `GET /api/i18n-translation/pt-BR/user-service.json`.

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Não | Default 3006 |
| `I18N_DIR` | Não | Pasta dos JSONs (default `./i18n`) |
| `NODE_ENV` | Não | Ambiente |

Ver [`.env.example`](../../i18n-translation-service/.env.example).

## Como executar

```bash
cd i18n-translation-service
npm install && npm run dev
```

## Convenções do código

- Chaves de tradução estáveis; não renomear sem atualizar todos os consumidores.
- Um arquivo JSON por microsserviço de origem das mensagens.
- Cache HTTP: `Cache-Control: public, max-age=60` nos estáticos.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- Demais `docs/services/*.md` (consumidores de i18n)

## Referências no repositório

- `i18n-translation-service/src/server.ts`
- `i18n-translation-service/i18n/`
