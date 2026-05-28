# Documentacao Tecnica — Total Fretes (Backend)

> Gerado automaticamente pela skill ProjectDoc AI
> Data: 2026-05-28

---

## 1. Visao Geral do Sistema

**Objetivo do projeto:**
Backend de microsservicos para o ecossistema Total Fretes. Atende o portal web de empresas e o app mobile de motoristas, centralizando autenticacao, cadastro, fretes e propostas, uploads, i18n e documentacao OpenAPI.

**Tipo de sistema:**
API REST em microsservicos com gateway Nginx, bancos por dominio, mensageria RabbitMQ e cache Redis.

**Status percebido:**
Em desenvolvimento ativo (TCC).

---

## 2. Tecnologias Utilizadas

| Categoria                     | Tecnologia / Versao |
| ----------------------------- | ------------------- |
| Linguagem principal           | TypeScript 5.9 |
| Runtime / Plataforma          | Node.js 22 |
| Framework principal           | Express 5 (swagger-service usa Express 4) |
| Banco de dados                | MySQL 8 |
| ORM / Query builder           | Sequelize 6 + mysql2 |
| Validacao                     | Zod 4 |
| Autenticacao                  | JWT (jsonwebtoken) + bcrypt |
| Mensageria                    | RabbitMQ (amqplib) |
| Cache                         | Redis (ioredis) |
| HTTP entre servicos           | axios |
| Containerizacao               | Docker + Docker Compose |
| Testes                        | Jest (scripts presentes) |
| Outras bibliotecas relevantes | Swagger UI, multer, nodemailer |

---

## 3. Arquitetura e Organizacao

**Padrao arquitetural identificado:**
Microsservicos com gateway Nginx e bancos isolados por dominio; comunicacao via HTTP e AMQP.

**Estrutura de diretorios principal:**

```
TCC_ADS_backEnd-TotalFretes/
├── docker-compose.yml
├── nginx/
├── packages/rpc-contracts/
├── docs/
├── authentication-service/
├── user-service/
├── company-service/
├── freight-service/
├── storage-service/
├── email-management-service/
├── mapbox-service/
├── i18n-translation-service/
└── swagger-service/
```

**Descricao das camadas/modulos:**

| Camada / Modulo | Responsabilidade |
| --------------- | ---------------- |
| routes / controllers | Exposicao HTTP e regras de acesso |
| schemas (Zod) | Validacao de entrada |
| models (Sequelize) | Persistencia em MySQL |
| messaging (AMQP) | Eventos assincornos (email) |
| utils / services | Integracoes externas (Mapbox, storage, auth) |

**Fluxo geral de uma requisicao:**
Cliente -> Nginx (gateway) -> microsservico de dominio -> validacao local de JWT -> controller -> schema Zod -> service/model -> MySQL -> resposta.

---

## 4. Regras de Negocio

### 4.1 Regras Explicitas

1. **Recuperacao de senha usa Redis + RabbitMQ**
   - Localizacao: docs/services/authentication-service.md
   - Descricao: codigo de reset e salvo no Redis e o envio do email e feito por fila AMQP.

2. **Roles emitidas no JWT**
   - Localizacao: docs/PROJECT.md
   - Descricao: perfis esperados no token sao USER, COMPANY e ADMIN.

3. **Owner check por subject_id (empresa)**
   - Localizacao: docs/services/company-service.md
   - Descricao: subject_id do JWT deve corresponder ao company.id nas operacoes do owner.

4. **Owner check por subject_id (motorista)**
   - Localizacao: docs/services/user-service.md
   - Descricao: subject_id do JWT deve corresponder ao user.id nas operacoes do owner.

5. **Fluxo de propostas de frete**
   - Localizacao: docs/services/freight-service.md
   - Descricao: empresa aceita/rejeita proposta; motorista confirma/declina.

6. **Upload de imagens com campo image**
   - Localizacao: docs/services/storage-service.md
   - Descricao: upload multipart deve usar o campo image e seguir validacao antes de persistir.

### 4.2 Regras Inferidas

1. **Isolamento por dominio**
   - Evidencia: cada servico principal tem seu proprio MySQL no compose.
   - Descricao: dados de cada dominio sao isolados por banco e por servico.

2. **Autenticacao centralizada**
   - Evidencia: login e contas no authentication-service e uso de subject_id em user/company.
   - Descricao: credenciais ficam fora dos servicos de dominio; estes validam JWT localmente.

3. **Mensagens de erro internacionalizadas**
   - Evidencia: i18n-translation-service serve JSON por servico e locale.
   - Descricao: respostas de erro tendem a usar chaves i18n padronizadas.

---

## 5. Componentes Principais

| Componente | Tipo | Responsabilidade |
| --------- | ---- | ---------------- |
| authentication-service | Service | Login, JWT, contas, reset de senha |
| user-service | Service | Dados do motorista, CNH, veiculos |
| company-service | Service | Dados da empresa, enderecos, imagem |
| freight-service | Service | Fretes, propostas e catalogos |
| storage-service | Service | Upload e metadados de arquivos |
| email-management-service | Worker/Service | Consumo de fila e envio de email |
| mapbox-service | Service | Proxy para API Mapbox |
| i18n-translation-service | Service | JSON i18n e endpoint interno |
| swagger-service | Service | Agregacao de OpenAPI e Swagger UI |
| nginx | Gateway | Roteamento unico com prefixo /api |
| rabbitmq | Infra | Mensageria para emails |
| redis | Infra | Cache temporario de reset de senha |
| @total-fretes/rpc-contracts | Package | Contratos Zod e topologia AMQP |

---

## 6. Fluxos Principais

### Fluxo: Login e uso de JWT

1. Cliente chama login no authentication-service via gateway.
2. Servico autentica e emite JWT com role e subject_id.
3. Demais servicos validam JWT localmente via JWT_SECRET.

### Fluxo: Recuperacao de senha

1. Cliente chama forgot-password.
2. Servico gera codigo, salva no Redis e publica evento em RabbitMQ.
3. email-management-service consome a fila e envia email SMTP.
4. Cliente valida codigo e redefine senha.

### Fluxo: Publicacao de frete e proposta

1. Empresa cria frete no freight-service.
2. Motorista cria proposta para o frete.
3. Empresa aceita/rejeita; motorista confirma/declina.

---

## 7. Boas Praticas Observadas

- Validacao de entrada com Zod em schemas por servico.
- Autenticacao centralizada com validacao local via JWT_SECRET.
- Gateway Nginx unifica prefixos e expande /api.
- Swagger agregado por servico via swagger-service.

---

## 8. Pontos de Atencao

| Severidade | Descricao | Localizacao |
| ---------- | --------- | ----------- |
| Alta | Segredo JWT compartilhado entre servicos exige gestao segura e rotacao | docs/PROJECT.md |
| Media | Swagger UI exposta no gateway sem controle de acesso | docs/services/swagger-service.md |
| Media | Variaveis de ambiente distribuidas por servico exigem disciplina operacional | docs/PROJECT.md |
| Baixa | Cobertura de testes nao esta documentada para a maioria dos servicos | docs/PROJECT.md |

---

## 9. Lacunas de Documentacao

- Nao ha ERD ou diagramas de modelo de dados por servico.
- Nao existe estrategia de testes formalizada (unitario, integracao, e2e).
- Falta padrao documentado de payload AMQP e erros compartilhados.

---

## 10. Diagramas C4 (Mermaid)

### Nivel 1 — Contexto

```mermaid
C4Context
  title Total Fretes - Backend

  Person(driver, "Motorista", "App mobile")
  Person(companyUser, "Empresa", "Portal web")
  System(system, "Total Fretes Backend", "API de fretes, contas e propostas")

  System_Ext(mapbox, "Mapbox API", "Geocoding e rotas")
  System_Ext(smtp, "SMTP", "Envio de email")

  Rel(driver, system, "Usa API", "HTTPS")
  Rel(companyUser, system, "Usa API", "HTTPS")
  Rel(system, mapbox, "Consulta rotas e geocoding", "HTTPS")
  Rel(system, smtp, "Envia emails", "SMTP")
```

### Nivel 2 — Containers

```mermaid
C4Container
  title Containers principais

  Container(nginx, "Nginx Gateway", "Nginx", "Unifica /api e roteia")
  Container(auth, "authentication-service", "Node.js/Express", "JWT e contas")
  Container(user, "user-service", "Node.js/Express", "Motoristas e veiculos")
  Container(company, "company-service", "Node.js/Express", "Empresas e enderecos")
  Container(freight, "freight-service", "Node.js/Express", "Fretes e propostas")
  Container(storage, "storage-service", "Node.js/Express", "Uploads e metadados")
  Container(email, "email-management-service", "Node.js", "Consumidor AMQP")
  Container(mapboxSvc, "mapbox-service", "Node.js/Express", "Proxy Mapbox")
  Container(i18n, "i18n-translation-service", "Node.js/Express", "JSON i18n")
  Container(swagger, "swagger-service", "Node.js/Express", "OpenAPI agregada")

  ContainerDb(dbAuth, "MySQL auth", "MySQL", "Contas")
  ContainerDb(dbUser, "MySQL user", "MySQL", "Motoristas")
  ContainerDb(dbCompany, "MySQL company", "MySQL", "Empresas")
  ContainerDb(dbFreight, "MySQL freight", "MySQL", "Fretes e propostas")
  ContainerDb(dbStorage, "MySQL storage", "MySQL", "Metadados de arquivos")

  Container(redis, "Redis", "Redis", "Cache reset de senha")
  Container(rmq, "RabbitMQ", "AMQP", "Eventos de email")

  Rel(nginx, auth, "Roteia", "HTTP")
  Rel(nginx, user, "Roteia", "HTTP")
  Rel(nginx, company, "Roteia", "HTTP")
  Rel(nginx, freight, "Roteia", "HTTP")
  Rel(nginx, storage, "Roteia", "HTTP")
  Rel(nginx, mapboxSvc, "Roteia", "HTTP")
  Rel(nginx, i18n, "Roteia", "HTTP")
  Rel(nginx, swagger, "Roteia", "HTTP")

  Rel(auth, dbAuth, "CRUD", "TCP")
  Rel(user, dbUser, "CRUD", "TCP")
  Rel(company, dbCompany, "CRUD", "TCP")
  Rel(freight, dbFreight, "CRUD", "TCP")
  Rel(storage, dbStorage, "CRUD", "TCP")

  Rel(auth, redis, "Cache codigo", "TCP")
  Rel(auth, rmq, "Publica eventos", "AMQP")
  Rel(email, rmq, "Consome fila", "AMQP")
```

### Nivel 3 — Componentes (authentication-service)

```mermaid
C4Component
  title authentication-service - Componentes principais

  Container_Boundary(authSvc, "authentication-service") {
    Component(authRoutes, "auth.routes.ts", "Express Router", "Rotas de auth")
    Component(accountRoutes, "account.routes.ts", "Express Router", "Rotas de conta")
    Component(authController, "auth.controller", "Controller", "Login e JWT")
    Component(accountController, "account.controller", "Controller", "CRUD de contas")
    Component(authSchemas, "schemas/*", "Zod", "Validacao de payload")
    Component(authMiddleware, "authMiddleware", "Middleware", "Validacao JWT")
    Component(accountModel, "models/ACCOUNTS", "Sequelize", "Conta")
    Component(redisClient, "lib/redisClient", "Redis", "Codigo reset")
    Component(amqpPublisher, "messaging/*", "AMQP", "Eventos de email")
  }

  Rel(authRoutes, authController, "Chama")
  Rel(accountRoutes, accountController, "Chama")
  Rel(authController, authSchemas, "Valida")
  Rel(accountController, authSchemas, "Valida")
  Rel(authController, accountModel, "CRUD")
  Rel(accountController, accountModel, "CRUD")
  Rel(authController, redisClient, "Cache")
  Rel(authController, amqpPublisher, "Publica")
  Rel(authRoutes, authMiddleware, "Protege rotas")
```

### Nivel 3 — Componentes (freight-service)

```mermaid
C4Component
  title freight-service - Componentes principais

  Container_Boundary(freightSvc, "freight-service") {
    Component(freightRoutes, "freight.routes.ts", "Express Router", "Rotas de frete")
    Component(proposalRoutes, "proposals.routes.ts", "Express Router", "Rotas de propostas")
    Component(freightController, "freight.controller", "Controller", "CRUD de fretes")
    Component(proposalController, "proposal.controller", "Controller", "Fluxo de propostas")
    Component(freightSchemas, "schemas/*", "Zod", "Validacao de payload")
    Component(freightModels, "models/*", "Sequelize", "Frete, proposta, status")
  }

  Rel(freightRoutes, freightController, "Chama")
  Rel(proposalRoutes, proposalController, "Chama")
  Rel(freightController, freightSchemas, "Valida")
  Rel(proposalController, freightSchemas, "Valida")
  Rel(freightController, freightModels, "CRUD")
  Rel(proposalController, freightModels, "CRUD")
```

### Nivel 3 — Componentes (user-service)

```mermaid
C4Component
   title user-service - Componentes principais

   Container_Boundary(userSvc, "user-service") {
      Component(userRoutes, "user.routes.ts", "Express Router", "Rotas de usuario")
      Component(cnhRoutes, "cnh.routes.ts", "Express Router", "Rotas de CNH")
      Component(vehicleRoutes, "vehicle.routes.ts", "Express Router", "Rotas de veiculos")
      Component(vehicleTypeRoutes, "vehicleType.routes.ts", "Express Router", "Catalogo de veiculos")
      Component(groupVehicleTypeRoutes, "groupVehicleType.routes.ts", "Express Router", "Grupo de veiculos")
      Component(userController, "user.controller", "Controller", "CRUD de usuario")
      Component(userSchemas, "schemas/*", "Zod", "Validacao de payload")
      Component(userModels, "models/*", "Sequelize", "Usuario, CNH, veiculos")
      Component(authClient, "AUTH_SERVICE_URL", "HTTP", "Criacao/remocao de conta")
      Component(storageClient, "STORAGE_SERVICE_URL", "HTTP", "Imagens de perfil")
   }

   Rel(userRoutes, userController, "Chama")
   Rel(userController, userSchemas, "Valida")
   Rel(userController, userModels, "CRUD")
   Rel(userController, authClient, "Integra")
   Rel(userController, storageClient, "Integra")
```

### Nivel 3 — Componentes (company-service)

```mermaid
C4Component
   title company-service - Componentes principais

   Container_Boundary(companySvc, "company-service") {
      Component(companyRoutes, "company.routes.ts", "Express Router", "Rotas de empresa")
      Component(addressRoutes, "address.routes.ts", "Express Router", "Rotas de endereco")
      Component(companyController, "company.controller", "Controller", "CRUD de empresa")
      Component(addressController, "address.controller", "Controller", "CRUD de endereco")
      Component(companySchemas, "schemas/*", "Zod", "Validacao de payload")
      Component(companyModels, "models/*", "Sequelize", "Empresa e enderecos")
      Component(authClient, "AUTH_SERVICE_URL", "HTTP", "Criacao/remocao de conta")
      Component(storageClient, "STORAGE_SERVICE_URL", "HTTP", "Imagens de empresa")
   }

   Rel(companyRoutes, companyController, "Chama")
   Rel(addressRoutes, addressController, "Chama")
   Rel(companyController, companySchemas, "Valida")
   Rel(addressController, companySchemas, "Valida")
   Rel(companyController, companyModels, "CRUD")
   Rel(addressController, companyModels, "CRUD")
   Rel(companyController, authClient, "Integra")
   Rel(companyController, storageClient, "Integra")
```

### Nivel 3 — Componentes (storage-service)

```mermaid
C4Component
   title storage-service - Componentes principais

   Container_Boundary(storageSvc, "storage-service") {
      Component(userImagesRoutes, "userImages.routes.ts", "Express Router", "Rotas de upload")
      Component(userImagesController, "userImages.controller", "Controller", "CRUD de imagens")
      Component(uploadUtils, "utils/upload.ts", "Multer", "Validacao de arquivos")
      Component(storageModels, "models/*", "Sequelize", "Metadados de imagens")
      Component(apiDocs, "api-docs.ts", "OpenAPI", "Documentacao")
   }

   Rel(userImagesRoutes, userImagesController, "Chama")
   Rel(userImagesController, uploadUtils, "Valida")
   Rel(userImagesController, storageModels, "CRUD")
```

### Nivel 3 — Componentes (email-management-service)

```mermaid
C4Component
   title email-management-service - Componentes principais

   Container_Boundary(emailSvc, "email-management-service") {
      Component(emailConsumer, "messaging/email.consumer.ts", "AMQP Consumer", "Consome fila")
      Component(emailAmqp, "messaging/email.amqp.ts", "AMQP", "Topologia e canal")
      Component(passwordResetMail, "services/passwordResetMail.ts", "Service", "Envio SMTP")
      Component(rpcContracts, "@total-fretes/rpc-contracts", "Zod", "Schemas de eventos")
   }

   Rel(emailConsumer, emailAmqp, "Configura")
   Rel(emailConsumer, passwordResetMail, "Chama")
   Rel(emailConsumer, rpcContracts, "Valida payload")
```

### Nivel 3 — Componentes (mapbox-service)

```mermaid
C4Component
   title mapbox-service - Componentes principais

   Container_Boundary(mapboxSvc, "mapbox-service") {
      Component(mapboxRoutes, "routes/mapBox.routes.ts", "Express Router", "Rotas Mapbox")
      Component(mapboxController, "controllers/mapBox.controller.ts", "Controller", "Proxy API Mapbox")
      Component(mapboxSchemas, "schemas/*", "Zod", "Validacao de query")
      Component(mapboxService, "services/*", "Service", "Chamada HTTPS")
   }

   Rel(mapboxRoutes, mapboxController, "Chama")
   Rel(mapboxController, mapboxSchemas, "Valida")
   Rel(mapboxController, mapboxService, "Chama")
```

### Nivel 3 — Componentes (i18n-translation-service)

```mermaid
C4Component
   title i18n-translation-service - Componentes principais

   Container_Boundary(i18nSvc, "i18n-translation-service") {
      Component(server, "src/server.ts", "Express App", "Servidor HTTP")
      Component(translateController, "internalTranslate.controller.ts", "Controller", "Traducao interna")
      Component(i18nFiles, "i18n/*", "JSON", "Arquivos por locale")
   }

   Rel(server, translateController, "Chama")
   Rel(server, i18nFiles, "Leitura")
```

### Nivel 3 — Componentes (swagger-service)

```mermaid
C4Component
   title swagger-service - Componentes principais

   Container_Boundary(swaggerSvc, "swagger-service") {
      Component(swaggerApp, "index.ts", "Express App", "Agregador OpenAPI")
      Component(fetcher, "axios", "HTTP Client", "Busca /api-docs")
      Component(swaggerUi, "swagger-ui-express", "UI", "Documentacao interativa")
      Component(proxy, "http-proxy-middleware", "Proxy", "Specs individuais")
   }

   Rel(swaggerApp, fetcher, "Coleta specs")
   Rel(swaggerApp, swaggerUi, "Serve UI")
   Rel(swaggerApp, proxy, "Proxy specs")
```

---

## 11. Recomendacoes Tecnicas

1. **Documentar modelos de dados por servico**
   - Motivo: facilita onboarding e alinhamento com frontends
   - Impacto esperado: menor retrabalho em integracoes

2. **Definir estrategia de testes por camada**
   - Motivo: cobertura ainda nao explicitada no repo
   - Impacto esperado: maior confiabilidade e regressao controlada

3. **Centralizar validacao de variaveis de ambiente**
   - Motivo: multiplos .env e dependencias cruzadas
   - Impacto esperado: erros de deploy detectados mais cedo

---

## 12. Conclusao Tecnica

O backend Total Fretes apresenta arquitetura consistente de microsservicos com gateway, isolamento por dominio e integracoes bem definidas (HTTP e AMQP). A base tecnica e moderna (Node.js 22, TypeScript 5.9, Express 5) e ja possui convencoes claras de validacao e documentacao OpenAPI. Os principais ganhos agora estao em consolidar a documentacao de dados e testes, e fortalecer a governanca de configuracoes e seguranca operacional.
