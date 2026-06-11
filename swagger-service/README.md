# Swagger Service (Documentação Centralizada)

Microserviço que **agrega a documentação OpenAPI/Swagger** de todos os microserviços em uma única interface e faz proxy de rotas para facilitar testes em desenvolvimento.

**Porta padrão:** `3005`

## Responsabilidades

- Buscar specs OpenAPI de cada microserviço (`/api-docs`)
- Mesclar em um documento unificado em `GET /docs`
- Servir UI Swagger em `/swagger-ui`
- Proxy reverso para rotas de auth, user, company e storage (dev)

## Endpoints

### Documentação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/docs` | Não | Spec OpenAPI agregada (JSON) |
| `GET` | `/swagger-ui` | Não | Interface Swagger UI |
| `GET` | `/health` | Não | Health check |

### Proxy reverso (desenvolvimento)

Repassa requisições para os microserviços correspondentes:

| Prefixo | Serviço de destino |
|---------|-------------------|
| `/auth`, `/account` | authentication-service |
| `/user`, `/cnh`, `/vehicle`, `/vehicleType`, `/groupVehicleType` | user-service |
| `/company`, `/address`, `/cnhType` | company-service |
| `/api/user-images` | storage-service |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
AUTH_SERVICE_URL=http://authentication-service:3000/
COMPANY_SERVICE_URL=http://company-service:3002/
USER_SERVICE_URL=http://user-service:3001/
STORAGE_SERVICE_URL=http://storage-service:3007/
FREIGHT_SERVICE_URL=http://freight-service:3008/

PORT=3005
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Sim | Porta HTTP do serviço. |
| `AUTH_SERVICE_URL` | Não | Padrão: `http://authentication-service:3000` |
| `USER_SERVICE_URL` | Não | Padrão: `http://user-service:3001` |
| `COMPANY_SERVICE_URL` | Não | Padrão: `http://company-service:3002` |
| `STORAGE_SERVICE_URL` | Não | Padrão: `http://storage-service:3007` |
| `FREIGHT_SERVICE_URL` | Não | Padrão: `http://freight-service:3008` |

## Acesso

Com Docker Compose rodando:

- Documentação agregada: [http://localhost/swagger-ui](http://localhost/swagger-ui) (via Nginx na porta 80)
- Direto no container: `http://localhost:3005/swagger-ui`
