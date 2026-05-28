# TCC_ADS_backEnd-TotalFretes

Backend do ecossistema **Total Fretes**: microsserviços Node.js com API Gateway Nginx, MySQL por domínio, Redis e RabbitMQ. Centraliza autenticação, usuários (motoristas), empresas, fretes, propostas, armazenamento de arquivos, Mapbox, i18n e documentação OpenAPI.

## Documentação

A referência completa para desenvolvimento e para skills do Cursor está em:

**[docs/PROJECT.md](docs/PROJECT.md)**

Documentação por microsserviço: **[docs/services/](docs/services/)**

## Executar com Docker

Configure os arquivos `.env` de cada serviço (use os `.env.example` como base) e suba a stack:

```bash
docker compose up --build
```

API disponível em **http://localhost** (porta 80).

## Repositórios relacionados

- Portal web empresa: `../TCC_ADS_TotalFretesEmpresa`
- App mobile motorista: `../TCC_ADS_appTotalFretes`
