# Scripts auxiliares — freight-service

## Seeds no startup (padrão)

Ao subir o serviço (`npm run dev` ou container Docker), após `sequelize.sync`, roda automaticamente:

1. Status de frete
2. Status de proposta
3. **Demo** (`DEMO-*`), somente se `DEMO_DATA_SEED_ON_STARTUP=true` no `.env` **raiz** do backend

As flags `DEMO_DATA_SEED_ENABLED` e `DEMO_DATA_SEED_ON_STARTUP` ficam **somente** no `.env` na raiz do monorepo (não nos `.env` dos serviços).

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DEMO_DATA_SEED_ENABLED` | `false` | Habilita execução da seed demo (script manual e rotas internas) |
| `DEMO_DATA_SEED_ON_STARTUP` | `false` | Roda seed demo automaticamente ao subir o container |
| `INTERNAL_SERVICE_KEY` | — | Chave para rotas internas entre serviços |

## Popular dados demo (manual)

Na raiz do backend, com a stack em execução:

```bash
npm run seed:demo
```

Isso popula storage, empresas, motoristas e fretes demo sem reiniciar os containers.

**Pré-requisito:** PNGs em `uploads/cargo-images/` e `uploads/company-images/` na raiz do backend (ver manifestos em `packages/demo-seed-data`).

Somente freight-service (tipos de carga + fretes demo, com stack já populada):

```bash
npm run seed:demo
```

Legado TF-TEST:

```bash
npm run seed:test
```
