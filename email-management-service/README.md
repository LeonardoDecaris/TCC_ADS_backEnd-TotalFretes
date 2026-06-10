# Microserviço de E-mail

Microserviço responsável pelo **envio assíncrono de e-mails** via SMTP. Atualmente consome a fila RabbitMQ do `authentication-service` para enviar o código de recuperação de senha.

**Porta padrão:** `3003`

## Responsabilidades

- Consumir fila `email.send` do RabbitMQ
- Enviar e-mail de recuperação de senha (código de 6 dígitos)
- Dead-letter queue para mensagens que falharam no envio

## Endpoints

Este serviço **não expõe API REST de negócio** — opera como consumidor RabbitMQ. Apenas health check HTTP:

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Não | Health check |

### Processamento assíncrono (RabbitMQ)

| Fila | Routing key | Ação |
|------|-------------|------|
| `email.send` | `email.send.password_reset` | Envia e-mail com código de recuperação de senha |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Servidor
PORT=3003
NODE_ENV=development
SERVICE_NAME=email-management-service

# SMTP (envio de e-mails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app_ou_smtp

# Mensageria
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
EMAIL_EVENTS_EXCHANGE=email.events
EMAIL_SEND_QUEUE=email.send
EMAIL_ROUTING_KEY_PASSWORD_RESET=email.send.password_reset
EMAIL_DLX_EXCHANGE=email.dlx
EMAIL_SEND_FAILED_QUEUE=email.send.failed
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `SMTP_HOST` | Sim | Host do servidor SMTP. |
| `SMTP_PORT` | Sim | Porta SMTP (587 para TLS, 465 para SSL). |
| `SMTP_USER` | Sim | Usuário/e-mail de autenticação SMTP. |
| `SMTP_PASS` | Sim | Senha ou senha de aplicativo SMTP. |
| `RABBITMQ_URL` | Sim | Conexão com RabbitMQ para consumir a fila de e-mails. |
| `EMAIL_*` | Não | Nomes de filas/exchanges; devem coincidir com o `authentication-service`. |

---

## Como obter as credenciais SMTP

O serviço usa **Nodemailer** com autenticação SMTP. Você precisa de um provedor de e-mail que permita envio via SMTP. Abaixo estão as opções mais comuns para desenvolvimento e produção.

### Opção 1 — Gmail (desenvolvimento / baixo volume)

1. Acesse sua conta Google em [https://myaccount.google.com](https://myaccount.google.com).
2. Ative a **verificação em duas etapas** (obrigatório para senhas de app).
3. Vá em **Segurança → Senhas de app** ([link direto](https://myaccount.google.com/apppasswords)).
4. Crie uma senha de app para "Mail" / "Outro (TotalFretes)".
5. Use no `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

> O Gmail não aceita a senha normal da conta — use sempre a **senha de app** gerada.

### Opção 2 — Mailtrap (recomendado para testes)

Ideal para desenvolvimento: os e-mails não chegam a destinatários reais, ficam numa inbox de teste.

1. Crie conta gratuita em [https://mailtrap.io](https://mailtrap.io).
2. Acesse **Email Testing → Inboxes → SMTP Settings**.
3. Copie host, porta, usuário e senha exibidos.
4. Exemplo típico:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=seu_usuario_mailtrap
SMTP_PASS=sua_senha_mailtrap
```

### Opção 3 — Brevo (Sendinblue) ou SendGrid (produção)

Para envio real em produção com maior volume:

**Brevo:**
1. Cadastre-se em [https://www.brevo.com](https://www.brevo.com).
2. Vá em **SMTP & API → SMTP**.
3. Gere uma chave SMTP e use:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu_email_cadastrado
SMTP_PASS=sua_chave_smtp_brevo
```

**SendGrid:**
1. Cadastre-se em [https://sendgrid.com](https://sendgrid.com).
2. Crie uma **API Key** com permissão de Mail Send.
3. Use `apikey` como usuário e a chave como senha:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua_api_key
```

### Testar o envio

Com o stack Docker rodando (`docker compose up`), solicite recuperação de senha pelo app ou via `POST /auth/forgot-password` no `authentication-service`. Verifique os logs do `email-management-service` ou a inbox do Mailtrap.
