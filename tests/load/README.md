# Testes de Carga (K6)

Cenários executados contra o API Gateway (Nginx) com stack Docker ativo.

## Pré-requisitos

1. Stack de teste rodando:

```bash
npm run test:integration:up
```

2. [K6 instalado](https://grafana.com/docs/k6/latest/set-up/install-k6/) (Windows: `choco install k6`) — versão **>= 0.47** para export OTLP

3. **Grafana Tempo** ativo na stack (portas `4317` gRPC, `4318` HTTP, `3200` query)

## Execução

Na **raiz do backend**:

```bash
# Smoke (~30s) — exporta traces para Tempo quando disponível
npm run test:load:smoke

# Todos os cenários (~8 min)
npm run test:load

# Sem export OTLP (CI ou Tempo indisponível)
node scripts/test-load.js smoke --without-traces
```

**K6 direto** (sem traces):

```bash
k6 run tests/load/k6/scenarios/smoke.js
```

Lista completa de comandos de teste: **[TESTING.md](../../TESTING.md)**.

## Observabilidade durante carga

Após subir a stack e rodar um cenário K6:

1. Abra **Grafana** em [http://localhost:3101](http://localhost:3101) (`admin` / `admin`)
2. Dashboard **K6 Load Test Traces** ou **Explore → Tempo**
3. Filtros úteis:
   - `{resource.service.name="k6-load-test"}` — spans do cliente K6
   - `{resource.service.name="freight-service"}` — spans do backend
4. Em um trace, use **Logs for this span** para correlacionar com Loki (`trace_id` nos access logs)

## Variáveis de ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `API_BASE_URL` | `http://localhost:80` | Gateway Nginx |
| `ADMIN_EMAIL` | `admin@totalfretes.com.br` | Login admin |
| `ADMIN_PASSWORD` | `Admin@123456` | Senha admin |
| `K6_OTEL_ENDPOINT` | `localhost:4317` | OTLP gRPC do Tempo (host) |
| `K6_WITH_TRACES` | `true` | Export OTLP automático se Tempo estiver up |

## Cenários

| Arquivo | Objetivo |
|---------|----------|
| `smoke.js` | Health checks sob carga mínima |
| `auth-login.js` | Latência de autenticação |
| `freight-read.js` | Leitura concorrente de fretes |
| `freight-write.js` | Leitura de tipos de carga (escrita leve) |

Cada cenário envia tags `scenario` e `endpoint` nos spans K6 para filtragem no Grafana.
