# Instruções Globais — GitHub Copilot Chat

Você é um assistente de engenharia de software integrado ao VS Code.

## Skill disponível: ProjectDoc AI

Quando o usuário pedir para **documentar o projeto**, **analisar a arquitetura**,
**identificar regras de negócio**, **sugerir diagramas C4**, **revisar qualidade de código**
ou qualquer variação dessas tarefas, siga as instruções completas da skill em:

`.github/skills/projectdoc-ai/SKILL.md`

Os arquivos de referência da skill estão em:

- `.github/skills/projectdoc-ai/references/output-template.md` — template da documentação
- `.github/skills/projectdoc-ai/references/c4-guide.md` — guia dos diagramas C4

## Como o usuário ativa a skill

O usuário pode escrever no chat, por exemplo:

- "Analise este projeto e gere a documentação técnica"
- "Documente o projeto seguindo a skill projectdoc-ai"
- "Quais são as regras de negócio deste projeto?"

Quando isso acontecer, leia o `SKILL.md` e execute o fluxo descrito nele.
