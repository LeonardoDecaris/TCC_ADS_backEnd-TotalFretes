# Testes — TotalFretes

Documentação completa em **[TESTING.md](../TESTING.md)** na raiz do backend.

Inventário detalhado (nome de cada teste por serviço e camada): **[TESTING.md § Inventário](../TESTING.md#inventário-de-testes-detalhado)**.

---

## Lista de comandos (raiz do projeto)

Execute na pasta `TCC_ADS_backEnd-TotalFretes/`.

### Suite e camadas

| Comando | Descrição |
|---------|-----------|
| `npm test` | Unitários dos 8 serviços — 76 testes (alias) |
| `npm run test:unit` | Unitários dos 8 serviços — 76 testes (~4 min) |
| `npm run test:integration` | Sobe Docker + integração (9 flows) |
| `npm run test:integration:local` | Integração (stack já rodando) |
| `npm run test:integration:up` | Apenas sobe o stack de teste |
| `npm run test:integration:down` | Derruba o stack de teste |
| `npm run test:load:smoke` | K6 smoke (~30s) |
| `npm run test:load` | K6 — todos os cenários |
| `npm run test:all` | Unitários → integração → carga |
| `npm run test:all:local` | `test:all` sem `docker up` |
| `npm run test:all:ci` | `test:all` + derruba stack ao final |

### Um serviço só (demo / apresentação)

| Comando | Descrição |
|---------|-----------|
| `npm run test:service -- --list` | Lista serviços e aliases |
| `npm run test:service -- mapbox` | Unitários do mapbox (~20–50s) |
| `npm run test:service -- auth` | Unitários do authentication |
| `npm run test:service -- freight --with-integration` | Unitários + integração do frete |
| `npm run test:service -- mapbox --with-integration --skip-stack` | Com API real, stack já up |

**Aliases:** `auth`, `user`, `company`, `freight`, `storage`, `mapbox`, `email`, `swagger` (ou `docs`)

### Scripts com flags extras

```powershell
node scripts/test-all.js --skip-load
node scripts/test-all.js --skip-stack --teardown
node scripts/test-load.js auth
node scripts/test-service.js --list
```

---

## Por pasta

| Onde | Comandos |
|------|----------|
| `<microserviço>/` | `npm test`, `npm run test:unit`, `npm run test:watch` |
| `tests/integration/` | `npm test`, `npm run test:watch` |
| `tests/load/k6/` | Ver [load/README.md](load/README.md) |

---

## Estrutura

- **Unitários** → `<microserviço>/test/unit/` (Jest + Supertest) — **76 testes** em 27 arquivos
- **Integração** → `tests/integration/flows/` (Jest + axios via Nginx)
- **Carga** → `tests/load/k6/` ([detalhes](load/README.md))
- **Utilitários** → `packages/test-utils/`
- **Resumo no terminal** → `scripts/lib/test-summary.js` (ao final das suites)
