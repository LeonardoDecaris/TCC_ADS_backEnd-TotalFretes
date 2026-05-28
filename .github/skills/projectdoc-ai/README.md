# ProjectDoc AI — GitHub Copilot Chat

Skill de documentação técnica automática para projetos de software,
integrada ao VS Code via GitHub Copilot Chat.

---

## Estrutura de arquivos

```
.github/
├── copilot-instructions.md              ← lido automaticamente pelo Copilot
└── skills/
    └── projectdoc-ai/
        ├── SKILL.md                     ← instruções da skill
        └── references/
            ├── output-template.md       ← template da documentação gerada
            └── c4-guide.md              ← guia de diagramas C4
```

---

## Como usar

### Forma mais simples

Abra o Copilot Chat no VS Code e escreva:

```
@workspace Analise este projeto e gere uma documentação técnica completa
com regras de negócio, arquitetura, boas práticas e sugestão de diagramas C4.
```

O `@workspace` faz o Copilot varrer automaticamente os arquivos do projeto.

### Forma com mais controle

Referencie arquivos específicos com `#file:` para direcionar a análise:

```
Analise este projeto e gere a documentação técnica.

#file:package.json
#file:src/app.ts
#file:src/services/OrderService.ts
#file:.github/skills/projectdoc-ai/SKILL.md
```

### Exemplo para este repositorio (Total Fretes)

Use os documentos ja existentes e os arquivos de infraestrutura para montar a visao
completa do monorepo de microsservicos:

```
Analise este monorepo e gere a documentacao tecnica completa.

#file:docs/PROJECT.md
#file:docker-compose.yml
#file:nginx/conf.d/app.conf
#file:docs/services/authentication-service.md
#file:docs/services/user-service.md
#file:docs/services/company-service.md
#file:docs/services/freight-service.md
#file:docs/services/storage-service.md
#file:docs/services/email-management-service.md
#file:docs/services/i18n-translation-service.md
#file:docs/services/mapbox-service.md
#file:docs/services/swagger-service.md
```

Se quiser incluir detalhes de implementacao, adicione um ou dois entrypoints:

```
#file:authentication-service/src/app.ts
#file:freight-service/src/app.ts
```

### Ativar a skill explicitamente

Se quiser garantir que o Copilot siga o fluxo completo da skill:

```
Siga as instruções em #file:.github/skills/projectdoc-ai/SKILL.md
e documente este projeto.
```

---

## Como saber que está funcionando

O Copilot vai:

1. Mencionar que está analisando a estrutura do projeto
2. Pedir ou acessar os arquivos relevantes
3. Gerar a documentação seguindo as 12 seções do template
4. Incluir sugestões de diagramas C4 em formato Mermaid

---

## Dica: salvar a documentação gerada

Quando o Copilot gerar o conteúdo no chat:

1. Crie um arquivo `DOCUMENTACAO_TECNICA.md` na raiz do projeto
2. Copie o conteúdo gerado para ele
3. Salve e commite junto com o projeto
