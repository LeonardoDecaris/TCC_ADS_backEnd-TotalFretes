# Guia de Diagramas C4

O modelo C4 organiza a arquitetura em 4 níveis de zoom progressivo.
Use este guia para determinar quais níveis sugerir e como descrevê-los em texto.

---

## Quando sugerir cada nível

| Nível | Nome        | Sugerir quando...                                                               |
| ----- | ----------- | ------------------------------------------------------------------------------- |
| 1     | Contexto    | **Sempre** — todo projeto tem um contexto                                       |
| 2     | Containers  | O sistema tem 2+ processos/serviços separados (ex: frontend + backend + banco)  |
| 3     | Componentes | Um container tem complexidade interna significativa (ex: módulos bem definidos) |
| 4     | Código      | Apenas se solicitado explicitamente — raramente útil em documentação geral      |

---

## Nível 1 — Contexto (System Context)

**Objetivo:** Mostrar o sistema no mundo real — quem usa, com o que se conecta.

**Elementos:**

- O próprio sistema (caixa central)
- Usuários / atores externos (pessoas)
- Sistemas externos com que interage (outros softwares, APIs de terceiros)

**Exemplo descritivo:**

```
[Pessoa: Usuário Final] — acessa via navegador
    ↓
[Sistema: Plataforma de Vendas] — gerencia pedidos e catálogo
    ↓                    ↓
[Sistema Externo:     [Sistema Externo:
 API de Pagamento]     Serviço de E-mail]
```

**Como gerar a base textual:**

1. Identifique o nome do sistema e sua função principal
2. Identifique quem usa (tipos de usuários)
3. Identifique dependências externas (no .env, package.json, código de integrações)
4. Descreva as relações em linguagem natural

---

## Nível 2 — Containers

**Objetivo:** Mostrar as peças técnicas do sistema — cada processo ou armazenamento separado.

**Elementos:**

- Frontend (React, Angular, mobile app...)
- Backend / API (Node.js, Spring, Django...)
- Banco de dados (PostgreSQL, MongoDB...)
- Cache (Redis...)
- Filas (RabbitMQ, Kafka...)
- Workers / jobs assíncronos

**Exemplo descritivo:**

```
[Container: React SPA] — interface do usuário, roda no browser
    ↓ HTTPS / REST
[Container: API Node.js/Express] — lógica de negócio, porta 3000
    ↓ SQL          ↓ TCP
[Container:       [Container:
 PostgreSQL]       Redis (cache)]
```

**Como identificar containers no projeto:**

- Múltiplos `package.json` ou projetos em subpastas = múltiplos containers
- `docker-compose.yml` = lista explícita de containers
- Pastas `/frontend` + `/backend` = dois containers distintos
- Arquivo único sem divisões externas = provavelmente um único container

---

## Nível 3 — Componentes

**Objetivo:** Mostrar a estrutura interna de um container — seus módulos e como interagem.

**Elementos:**

- Controllers / Routers
- Services / Use Cases
- Repositories / DAOs
- Middlewares
- Módulos de domínio

**Exemplo descritivo:**

```
Dentro do Container [API Node.js]:

[AuthController] → [AuthService] → [UserRepository] → [PostgreSQL]
                       ↓
               [JwtTokenService]

[OrderController] → [OrderService] → [OrderRepository] → [PostgreSQL]
                        ↓
                [PaymentGatewayService] → [API Stripe externa]
```

**Como identificar componentes:**

- Analise as pastas `controllers/`, `services/`, `repositories/`, `modules/`
- Trace o caminho de uma requisição do entry point até o banco
- Identifique dependências entre classes (injeção de dependência, imports)

---

## Dicas para a descrição textual

Ao sugerir os diagramas na documentação, sempre forneça:

1. **A lista de elementos** com seus nomes reais (do código)
2. **As relações** entre eles (quem chama quem, via que protocolo)
3. **A tecnologia** de cada elemento
4. **Uma sugestão de ferramenta** para o desenvolvedor renderizar o diagrama:
   - [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML) — integra com PlantUML
   - [Structurizr](https://structurizr.com/) — ferramenta oficial do criador do C4
   - [Mermaid C4](https://mermaid.js.org/syntax/c4.html) — renderiza direto no GitHub/Markdown

---

## Exemplo de saída Mermaid C4 (para sugerir ao desenvolvedor)

```
C4Context
  title Sistema de Gerenciamento de Pedidos

  Person(user, "Usuário", "Cliente da plataforma")
  System(app, "Order System", "Gerencia pedidos e catálogo")
  System_Ext(payment, "API Stripe", "Processamento de pagamento")
  System_Ext(email, "SendGrid", "Envio de e-mails transacionais")

  Rel(user, app, "Usa", "HTTPS")
  Rel(app, payment, "Processa pagamento", "HTTPS/REST")
  Rel(app, email, "Envia notificações", "HTTPS/REST")
```

Inclua sempre um bloco de código como este na documentação para o desenvolvedor poder renderizar.
