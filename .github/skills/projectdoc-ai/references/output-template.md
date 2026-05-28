# Template de Documentação Técnica

> Instrução para o modelo: substitua todos os campos entre `{chaves}` com informações reais
> extraídas do projeto. Remova seções que genuinamente não se aplicam, mas nunca omita
> uma seção por falta de esforço na análise.

---

# Documentação Técnica — {Nome do Projeto}

> Gerado automaticamente pela skill **ProjectDoc AI**
> Data: {data atual}

---

## 1. Visão Geral do Sistema

**Objetivo do projeto:**
{Descreva em 2-4 frases o que o sistema faz, para quem e qual problema resolve.}

**Tipo de sistema:**
{Ex: API REST, aplicação web fullstack, CLI, microsserviço, biblioteca, etc.}

**Status percebido:**
{Ex: Em desenvolvimento ativo / Protótipo / Sistema legado em manutenção}

---

## 2. Tecnologias Utilizadas

| Categoria                     | Tecnologia / Versão                        |
| ----------------------------- | ------------------------------------------ |
| Linguagem principal           | {ex: TypeScript 5.x}                       |
| Runtime / Plataforma          | {ex: Node.js 20, JVM 17, Python 3.11}      |
| Framework principal           | {ex: NestJS, Spring Boot, Django, Express} |
| Banco de dados                | {ex: PostgreSQL, MongoDB, SQLite}          |
| ORM / Query builder           | {ex: TypeORM, Hibernate, SQLAlchemy}       |
| Autenticação                  | {ex: JWT, OAuth2, Passport.js}             |
| Containerização               | {ex: Docker + Docker Compose}              |
| Testes                        | {ex: Jest, JUnit 5, pytest}                |
| Outras bibliotecas relevantes | {liste as mais importantes}                |

---

## 3. Arquitetura e Organização

**Padrão arquitetural identificado:**
{Ex: MVC, Arquitetura em camadas, Hexagonal/Ports & Adapters, CQRS, Monolito, etc.}

**Estrutura de diretórios principal:**

```
{cole aqui a árvore de diretórios simplificada, apenas os relevantes}
```

**Descrição das camadas/módulos:**

| Camada / Módulo | Responsabilidade |
| --------------- | ---------------- |
| {nome}          | {o que faz}      |
| {nome}          | {o que faz}      |

**Fluxo geral de uma requisição:**
{Descreva em prosa ou lista numerada o caminho que uma requisição típica percorre no sistema.}

---

## 4. Regras de Negócio

### 4.1 Regras Explícitas

> Identificadas diretamente no código-fonte.

1. **{Nome da regra}**
   - Localização: `{arquivo:linha ou função}`
   - Descrição: {o que a regra faz}

2. **{Nome da regra}**
   - Localização: `{arquivo:linha ou função}`
   - Descrição: {o que a regra faz}

_(continue listando todas encontradas)_

### 4.2 Regras Inferidas

> Deduzidas a partir de nomes, estruturas e relacionamentos.

1. **{Nome da regra inferida}**
   - Evidência: {o que levou a esta conclusão}
   - Descrição: {o que parece ser a regra}

---

## 5. Componentes Principais

| Componente               | Tipo                                  | Responsabilidade |
| ------------------------ | ------------------------------------- | ---------------- |
| `{NomeClasse / arquivo}` | {Service / Controller / Model / etc.} | {o que faz}      |
| `{NomeClasse / arquivo}` | {Service / Controller / Model / etc.} | {o que faz}      |

---

## 6. Fluxos Principais

### Fluxo: {Nome do fluxo, ex: "Cadastro de usuário"}

1. {Passo 1}
2. {Passo 2}
3. {Passo 3}
   ...

_(repita para cada fluxo principal identificado)_

---

## 7. Boas Práticas Observadas

- {Ex: Separação clara entre controllers e services}
- {Ex: Uso de DTOs para validação de entrada}
- {Ex: Variáveis de ambiente para configurações sensíveis}
- {Ex: Testes unitários cobrindo os casos principais}

---

## 8. Pontos de Atenção

> Riscos técnicos, desvios de boas práticas ou inconsistências encontradas.

| Severidade | Descrição               | Localização           |
| ---------- | ----------------------- | --------------------- |
| 🔴 Alta    | {descrição do problema} | `{arquivo ou módulo}` |
| 🟡 Média   | {descrição do problema} | `{arquivo ou módulo}` |
| 🟢 Baixa   | {descrição do problema} | `{arquivo ou módulo}` |

---

## 9. Lacunas de Documentação

- {Ex: README desatualizado — não menciona a variável X necessária}
- {Ex: Ausência de testes para o módulo Y}
- {Ex: Funções críticas sem comentários explicativos}
- {Ex: Nenhuma documentação de API encontrada (Swagger, OpenAPI)}

---

## 10. Sugestão de Diagramas C4

_(Consulte c4-guide.md para a descrição completa de cada nível)_

### Nível 1 — Contexto

```
[Sistema: {Nome}] — {O que faz em uma linha}
  → recebe requisições de: {Usuários / sistemas externos}
  → depende de: {Bancos de dados, APIs externas, serviços de terceiros}
```

### Nível 2 — Containers

```
{Nome do Container 1} ({tecnologia}) — {responsabilidade}
{Nome do Container 2} ({tecnologia}) — {responsabilidade}
  → {Container 1} se comunica com {Container 2} via {protocolo/método}
```

### Nível 3 — Componentes

_(somente se o projeto tiver complexidade suficiente)_

```
Dentro de {Container principal}:
  [{Componente A}] → [{Componente B}] → [{Componente C}]
```

---

## 11. Recomendações Técnicas

> Ações concretas sugeridas para evolução do projeto.

1. **{Recomendação}**
   - Motivo: {por que é importante}
   - Impacto esperado: {o que melhora}

2. **{Recomendação}**
   - Motivo: {por que é importante}
   - Impacto esperado: {o que melhora}

---

## 12. Conclusão Técnica

{Parágrafo resumindo o estado geral do projeto: pontos fortes, principais riscos e próximos
passos recomendados. Deve ser útil tanto para o desenvolvedor quanto para uma banca avaliadora.}

---

_Documentacao gerada pela skill ProjectDoc AI — GitHub Copilot (GPT-5.2-Codex)_
