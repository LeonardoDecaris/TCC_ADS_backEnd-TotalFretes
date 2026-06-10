# TotalFretes — Backend

Monorepo de microserviços do **TotalFretes** (TCC ADS): plataforma de gestão de fretes que conecta empresas contratantes a motoristas/caminhoneiros.

## Arquitetura

```
App Mobile (React Native)
        │
        ▼
    Nginx (gateway :80)
        │
        ├── authentication-service  :3000  — login, JWT, recuperação de senha
        ├── user-service            :3001  — motoristas, CNH, veículos
        ├── company-service         :3002  — empresas, endereços, pagamento
        ├── email-management-service :3003 — envio de e-mails (SMTP)
        ├── mapbox-service          :3004  — rotas, geocoding, telemetria
        ├── swagger-service         :3005  — documentação API agregada
        ├── notification-service    :3006  — notificações in-app
        ├── storage-service         :3007  — upload de imagens
        └── freight-service         :3008  — fretes, propostas, status
```

Infraestrutura compartilhada: **MySQL** (banco por serviço), **Redis**, **RabbitMQ**, **Grafana/Loki** (observabilidade).

## Microserviços

Cada serviço possui seu próprio `README.md` com descrição e variáveis `.env`:

| Serviço | README | Porta |
|---------|--------|-------|
| Autenticação | [authentication-service/README.md](./authentication-service/README.md) | 3000 |
| Usuário (motorista) | [user-service/README.md](./user-service/README.md) | 3001 |
| Empresa | [company-service/README.md](./company-service/README.md) | 3002 |
| E-mail | [email-management-service/README.md](./email-management-service/README.md) | 3003 |
| Mapbox | [mapbox-service/README.md](./mapbox-service/README.md) | 3004 |
| Swagger | [swagger-service/README.md](./swagger-service/README.md) | 3005 |
| Notificações | [notification-service/README.md](./notification-service/README.md) | 3006 |
| Storage | [storage-service/README.md](./storage-service/README.md) | 3007 |
| Fretes | [freight-service/README.md](./freight-service/README.md) | 3008 |

> **E-mail** e **Mapbox** incluem instruções detalhadas de como obter credenciais (SMTP e token Mapbox).

## Configuração inicial

1. Copie o `.env.example` de cada serviço para `.env` e preencha conforme o README do serviço.
2. Copie `.env.example` da raiz para `.env` (credenciais RabbitMQ):

```env
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
```

3. Suba o stack:

```bash
docker compose up -d
```

4. Acesse a documentação em [http://localhost/swagger-ui](http://localhost/swagger-ui).

## Variável compartilhada importante

`JWT_SECRET` deve ser **idêntica** em todos os serviços que validam token:
authentication, user, company, freight, storage, notification e mapbox.

## Desenvolvimento local

Cada serviço pode ser executado individualmente com `npm run dev` dentro da pasta do serviço, desde que o `.env` aponte para os hosts corretos (localhost ou containers Docker).
