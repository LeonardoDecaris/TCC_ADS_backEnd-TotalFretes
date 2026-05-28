# user-service

## Resumo

Microsserviço do **caminhoneiro (motorista)**: dados pessoais, CNH, tipos/grupos de veículo e veículos vinculados. Credenciais ficam no `authentication-service` (`subject_id` = id do usuário aqui).

## Responsabilidades

- CRUD de usuário
- Tipos de CNH (catálogo admin)
- Grupos e tipos de veículo
- Registro de veículo e vínculo ao usuário
- Encerramento de conta (`/user/end-account`)

## Stack e dependências

- Express 5, Sequelize, MySQL, Zod, jsonwebtoken
- axios → `AUTH_SERVICE_URL`, `STORAGE_SERVICE_URL`, `I18N_SERVICE_URL`

## Estrutura de pastas

```text
user-service/src/
├── routes/
│   ├── user.routes.ts
│   ├── cnh.routes.ts
│   ├── vehicle.routes.ts
│   ├── vehicleType.routes.ts
│   └── groupVehicleType.routes.ts
├── controllers/, models/, schemas/, middleware/
└── api-docs.ts
```

## Integrações

| Destino | Uso |
|---------|-----|
| authentication-service | Criação/remoção de conta |
| storage-service | Imagens de perfil |
| i18n-translation-service | Mensagens de erro |

**Chamado por:** app motorista (`/api/user`, `/api/cnh`, `/api/vehicle*`).

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3001 |
| Prefixo Nginx | `/api/user`, `/api/cnh`, `/api/group-vehicle-type`, `/api/vehicle-type`, `/api/vehicle` |
| MySQL (host) | **3307** |

## API / rotas principais

### User (`/user`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/` | — | Cria usuário |
| POST | `/end-account` | — | Fluxo de encerramento |
| GET | `/:id` | Sim | Busca por id (dono ou COMPANY) |
| GET | `/` | ADMIN | Lista todos |
| PATCH/PUT | `/:id` | Sim | Atualiza (dono) |
| DELETE | `/:id` | Sim | Remove (dono) |

### CNH (`/cnh`)

Catálogo de tipos de CNH — rotas restritas a **ADMIN**.

### Vehicle (`/vehicle`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/register` | Cria veículo e associa ao usuário logado |
| POST | `/` | Cria veículo |
| GET | `/:id` | Detalhe |
| GET | `/` | Lista (ADMIN) |

### Group / vehicle type

Catálogos para o fluxo de cadastro de veículo no app (`/api/group-vehicle-type`, `/api/vehicle-type`).

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Sim | Porta HTTP |
| `JWT_SECRET` | Sim | Validação local do JWT |
| `DB_*` | Sim | MySQL |
| `AUTH_SERVICE_URL` | Sim | Integração com auth |
| `STORAGE_SERVICE_URL` | Sim | Upload de imagens |
| `I18N_SERVICE_URL` | Não | i18n |

Ver [`.env.example`](../../user-service/.env.example).

## Como executar

```bash
cd user-service
npm install && npm run dev
```

## Convenções do código

- `authMiddleware` + `authorizeRoles('USER'|'COMPANY'|'ADMIN')` ou `allowOwnerOrRoles()`.
- `subject_id` do JWT deve corresponder ao `user.id` para operações do motorista.
- Manter sincronia com fluxo de cadastro do app (`SingUp` → CNH → senha → veículo).

## Relacionados

- [authentication-service.md](authentication-service.md)
- [storage-service.md](storage-service.md)
- Repositório cliente: `../TCC_ADS_appTotalFretes` (app motorista)

## Referências no repositório

- `user-service/src/routes/user.routes.ts`
- `user-service/src/routes/vehicle.routes.ts`
