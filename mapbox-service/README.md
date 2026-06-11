# Microserviço Mapbox

Microserviço responsável por **geocodificação, rotas e telemetria** usando a API Mapbox. Expõe endpoints para calcular rotas de frete, converter endereços em coordenadas e registrar rastreamento do motorista em tempo real.

**Porta padrão:** `3004`

## Responsabilidades

- Geocodificação forward e reverse (endereço ↔ coordenadas)
- Cálculo de rota de frete com distância, tempo e instruções de navegação
- Cache em memória de geocoding e rotas
- Telemetria: registro de localização do motorista e trilha por frete
- Persistência de dados de telemetria no MySQL

## Endpoints

> Rotas de telemetria marcadas com **Auth** exigem `Authorization: Bearer <token>`.

### Utilitários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Não | Health check |

### Rotas e geocodificação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/rota-frete` | Não | Calcula rota do frete (query: origem, carga, destino) |
| `GET` | `/api/geocode-forward` | Não | Endereço → coordenadas (query: `q`) |
| `GET` | `/api/geocode-reverse` | Não | Coordenadas → endereço (query: `lng`, `lat`) |

### Telemetria

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| `POST` | `/api/telemetry/location` | Sim | USER | Registra posição GPS do motorista |
| `GET` | `/api/telemetry/trail/:freightId` | Sim | COMPANY, USER, ADMIN | Trilha percorrida do frete |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
PORT=3004
MAPBOX_SECRET_TOKEN=
MAPBOX_ALLOW_SELF_SIGNED_TLS=false

JWT_SECRET=secret
DB_NAME=authentication_service
DB_USER=root
DB_PASS=123456
DB_HOST=authentication-service-database

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=mapbox_service
MYSQL_ROOT_HOST=%

FREIGHT_SERVICE_URL=http://freight-service:3008/

SERVICE_NAME=mapbox-service
LOKI_HOST=http://loki:3100/
LOG_LEVEL=info
NODE_ENV=development
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `MAPBOX_SECRET_TOKEN` | Sim | Token **secreto** da Mapbox com acesso às APIs de Geocoding e Directions. |
| `JWT_SECRET` | Sim | Mesma chave do `authentication-service`. |
| `DB_*` | Sim | Banco para persistir telemetria/rastreamento. |
| `FREIGHT_SERVICE_URL` | Não | URL do freight-service para consultas relacionadas. |
| `MAPBOX_ALLOW_SELF_SIGNED_TLS` | Não | `true` apenas em ambientes com certificado autoassinado (dev). |

---

## Como obter o token Mapbox

O serviço chama as APIs **Geocoding** e **Directions** da Mapbox. É necessário um token com escopos adequados — use um **Secret token** no backend (nunca exponha no app mobile).

### Passo a passo

1. **Criar conta**
   - Acesse [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/) e cadastre-se (plano gratuito inclui créditos mensais).

2. **Acessar tokens**
   - Faça login e vá em [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/).

3. **Criar um Secret token**
   - Clique em **Create a token**.
   - Dê um nome (ex.: `TotalFretes Backend`).
   - Selecione o tipo **Secret** (tokens que começam com `sk.`).
   - Marque os escopos necessários:
     - `styles:read` (opcional, se usar mapas)
     - **`geocoding`** — conversão endereço ↔ coordenadas
     - **`directions`** — cálculo de rotas
   - Clique em **Create token** e copie o valor.

4. **Configurar no `.env`**

```env
MAPBOX_SECRET_TOKEN=sk.eyJ1Ijoi...seu_token_completo
```

5. **Restringir o token (recomendado em produção)**
   - Na página do token, configure **URL restrictions** para limitar chamadas ao domínio/IP do servidor.
   - Monitore uso em **Statistics** no dashboard Mapbox.

### Token público vs secreto

| Tipo | Prefixo | Uso |
|------|---------|-----|
| Public | `pk.` | App mobile / frontend (Mapbox SDK) |
| Secret | `sk.` | **Backend** (`mapbox-service`) — nunca commitar no repositório |

O app React Native usa o token público (`EXPO_PUBLIC_MAPBOX_TOKEN` ou similar). O `mapbox-service` usa o token secreto para chamadas server-side às APIs REST.

### Verificar se funciona

Com o serviço rodando, teste geocoding:

```bash
curl "http://localhost:3004/api/geocode-forward?endereco=Av%20Paulista,%20São%20Paulo"
```

Resposta com coordenadas indica que o token está correto.

### Limites e custos

- A Mapbox oferee tier gratuito com volume mensal limitado.
- Geocoding e Directions consomem requisições do plano — monitore em [https://account.mapbox.com/](https://account.mapbox.com/).
- O serviço usa cache em memória (30 min geocoding, 45 s rotas) para reduzir chamadas repetidas.
