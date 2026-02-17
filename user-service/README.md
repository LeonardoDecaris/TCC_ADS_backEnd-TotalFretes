# Microserviço de Autenticação

Microserviço responsável por autenticação, emissão de tokens JWT e autorização por roles (caminhoneiro/usuário, empresa, admin). Outros microserviços (ex.: Caminhoneiro, Empresa) podem validar o token via HTTP.

## Endpoints

### `POST /auth/login`

Login com CPF e senha. Retorna um token JWT contendo `id` e `role`.

### `POST /auth/register`

Registro de usuário (delega para o serviço de usuário configurado em `USER_SERVICE_URL`).

### `GET /auth/verify-token`

Validação de token para uso interno (requer header `Authorization: Bearer <token>`). Retorna o usuário decodificado.

---

## Contrato: validação para outros microserviços

Os serviços **Caminhoneiro** e **Empresa** devem usar o endpoint abaixo para validar o token em cada requisição protegida. Use o pacote **@totalfretes/auth-client** (pasta `auth-client` na raiz do monorepo) para chamadas com timeout, retry, circuit breaker e cache.

### `POST /auth/validate`

Valida o token e retorna `id` e `role` do usuário. Contrato estável — não alterar campos sem versionar a API.

**Request**

- **Headers**
  - `Authorization: Bearer <token>` (recomendado)
  - `Content-Type: application/json`
- **Body (opcional)**  
  - `{ "token": "<token>" }` — alternativa ao header

**Response 200 — token válido**

```json
{
  "valid": true,
  "user": {
    "id": 123,
    "role": "usuario"
  }
}
```

- `role`: `"usuario"` (caminhoneiro), `"empresa"` ou `"admin"`.

**Response 401 — token inválido ou ausente**

```json
{
  "valid": false,
  "message": "Token inválido ou expirado."
}
```

**Recomendações para clientes**

- Timeout: 3–5 s.
- Em timeout ou 5xx: tratar como indisponibilidade (ex.: retry com backoff ou responder 503).
- Não fazer retry em 401.

---

### `GET /auth/health`

Health check para load balancer e orquestração.

**Response 200**

```json
{
  "status": "up",
  "database": "connected"
}
```

**Response 503**

```json
{
  "status": "down",
  "database": "disconnected"
}
```

---

## Roles

| Role      | Uso na regra de negócio |
|-----------|--------------------------|
| `usuario` | Caminhoneiro             |
| `empresa` | Empresa                  |
| `admin`   | Administrador            |

Os microserviços devem aplicar `authorizeRoles('usuario', 'admin')` ou `authorizeRoles('empresa', 'admin')` conforme a rota, após obter `user` via `POST /auth/validate`.
