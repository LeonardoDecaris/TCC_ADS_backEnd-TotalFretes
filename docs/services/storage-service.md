# storage-service

## Resumo

Microsserviço de **armazenamento de arquivos**: upload de imagens (perfil de usuário/empresa), metadados em MySQL e serviço de arquivos estáticos via Nginx. Não gerencia credenciais.

## Responsabilidades

- Upload, atualização e exclusão de imagens de usuário (`USER_IMAGES`)
- Metadados (caminho, tipo, vínculo com subject)
- Exposição de arquivos via `/api/user-images/` e `/api/uploads/`
- Health check

## Stack e dependências

- Express 5, Sequelize, MySQL, multer
- Volume Docker: `storage-service-uploads` + backup em `./uploads`

## Estrutura de pastas

```text
storage-service/src/
├── routes/userImages.routes.ts
├── controllers/userImages.controller.ts
├── models/
├── utils/upload.ts
└── api-docs.ts
```

## Integrações

| Origem | Uso |
|--------|-----|
| user-service | Upload de avatar do motorista |
| company-service | Imagem da empresa (via storage ou proxy) |

**Chamado por:** clientes e outros MS via Nginx.

## Porta e gateway

| Item | Valor |
|------|-------|
| Porta interna | 3007 |
| Prefixo Nginx | `/api/user-images/`, `/api/uploads/` |
| MySQL (host) | **3309** |

## API / rotas principais

Rotas internas em `/user-images` (montagem no `app.ts`).

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/upload` | Upload (form-data, campo `image`) |
| GET | `/` | Lista metadados |
| GET | `/:id` | Metadado por id |
| PUT | `/:id` | Atualiza imagem |
| DELETE | `/:id` | Remove registro e arquivo |
| GET | `/health` | Health |

Via gateway: `POST /api/user-images/upload`, etc.

## Variáveis de ambiente

| VAR | Obrigatória | Descrição |
|-----|-------------|-----------|
| `PORT` | Sim | Porta HTTP |
| `DB_*` | Sim | MySQL |
| `UPLOAD_DIR` | Sim | Diretório de uploads no container |
| `BACKUP_UPLOAD_DIR` | Não | Backup no host (`./uploads`) |
| `I18N_SERVICE_URL` | Não | i18n |

Ver [`.env.example`](../../storage-service/.env.example).

## Como executar

```bash
cd storage-service
npm install && npm run dev
```

Garantir permissão de escrita em `UPLOAD_DIR`.

## Convenções do código

- Campo multipart sempre `image` (alinhar com clientes).
- Validar MIME/tamanho em `upload.ts` antes de persistir.
- Não expor caminhos absolutos do filesystem na API pública.

## Relacionados

- [../PROJECT.md](../PROJECT.md)
- [user-service.md](user-service.md)
- [company-service.md](company-service.md)

## Referências no repositório

- `storage-service/src/routes/userImages.routes.ts`
- `storage-service/README.md`
