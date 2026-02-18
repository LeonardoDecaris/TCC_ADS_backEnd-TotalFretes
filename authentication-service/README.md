# Microserviço de Autenticação

Microserviço responsável por credenciais, login e emissão de JWT. As credenciais ficam centralizadas aqui (não no `user-service` e `company-service`).

## Modelo de dados

### `ACCOUNTS`

- `id`
- `email` (unique)
- `password` (hash bcrypt)
- `account_type_id` (FK → `ACCOUNT_TYPES`)
- `subject_id` (id da entidade de negócio: USER/COMPANY)
- `status_id` (FK → `ACCOUNT_STATUS_TYPES`)
- `created_at`
- `updated_at`
- `userUpdate_at`

### `ACCOUNT_TYPES`

- `id`
- `name` (`USER`, `COMPANY`, `ADMIN`)
- `created_at`
- `updated_at`
- `userUpdate_at`

### `ACCOUNT_STATUS_TYPES`

- `id`
- `name` (`ACTIVE`, `BLOCKED`, `DISABLED`)
- `created_at`
- `updated_at`
- `userUpdate_at`

> Na inicialização, o serviço garante automaticamente os registros padrão de tipo e status.

## Endpoints

### `POST /auth/login`

Login com `email` e `password`. Retorna JWT com:

- `id`: `subject_id` (id do usuário/empresa no respectivo microserviço)
- `role`: `usuario` | `empresa` | `admin`

### `POST /auth/register`

Cria conta de autenticação.

Payload mínimo:

```json
{
  "email": "user@dominio.com",
  "password": "123456",
  "subject_id": 10,
  "account_type": "USER"
}
```

Campos opcionais:

- `status`/`status_name` (`ACTIVE`, `BLOCKED`, `DISABLED`) — padrão: `ACTIVE`
- `account_type_id` e `status_id` (alternativa aos nomes)

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

## Roles no token

| Role      | Uso na regra de negócio |
|-----------|--------------------------|
| `usuario` | Caminhoneiro             |
| `empresa` | Empresa                  |
| `admin`   | Administrador            |

Os microserviços devem aplicar `authorizeRoles('usuario', 'admin')` ou `authorizeRoles('empresa', 'admin')` conforme a rota, após obter `user` via `POST /auth/validate`.
