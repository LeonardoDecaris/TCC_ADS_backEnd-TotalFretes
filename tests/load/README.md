# Testes de Carga (K6)

Cenários executados contra o API Gateway (Nginx) com stack Docker ativo.

## Pré-requisitos

1. Stack de teste rodando:

```bash
npm run test:integration:up
```

2. [K6 instalado](https://grafana.com/docs/k6/latest/set-up/install-k6/) (Windows: `choco install k6`)

## Execução

Na **raiz do backend**:

```bash
# Smoke (~30s)
npm run test:load:smoke

# Todos os cenários (~8 min)
npm run test:load

# Cenário específico via script
node scripts/test-load.js smoke
node scripts/test-load.js auth
node scripts/test-load.js freight-read
node scripts/test-load.js freight-write
node scripts/test-load.js all
```

**K6 direto:**

```bash
k6 run tests/load/k6/scenarios/smoke.js
k6 run tests/load/k6/scenarios/auth-login.js
k6 run tests/load/k6/scenarios/freight-read.js
k6 run tests/load/k6/scenarios/freight-write.js
```

Lista completa de comandos de teste: **[TESTING.md](../../TESTING.md)**.

## Variáveis de ambiente

| Variável | Default |
|----------|---------|
| `API_BASE_URL` | `http://localhost:80` |
| `ADMIN_EMAIL` | `admin@totalfretes.com.br` |
| `ADMIN_PASSWORD` | `Admin@123456` |

## Cenários

| Arquivo | Objetivo |
|---------|----------|
| `smoke.js` | Health checks sob carga mínima |
| `auth-login.js` | Latência de autenticação |
| `freight-read.js` | Leitura concorrente de fretes |
| `freight-write.js` | Leitura de tipos de carga (escrita leve) |
