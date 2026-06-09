export const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Storage Service',
    version: '1.0.0',
    description: 'Microserviço para upload e persistência de metadados de imagens de usuário.',
  },
  paths: {
    '/user-images/upload': {
      post: {
        summary: 'Upload de imagem de usuário',
        description:
          'Realiza o upload de uma imagem de usuário. Aceita apenas imagens (JPEG, PNG, WEBP, GIF) de até 5MB.',
        tags: ['UserImages'],
        parameters: [
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Bearer token.',
          },
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Chave opcional para reexecução segura de requisições.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo de imagem do usuário (campo form-data `image`).',
                  },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Imagem salva com sucesso.' },
          400: {
            description: 'Requisição inválida (nenhuma imagem enviada, tipo inválido ou arquivo muito grande).',
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Sem permissão.' },
          409: { description: 'Conflito de idempotência para mesma chave com payload diferente.' },
          500: { description: 'Erro interno ao processar o upload ou salvar metadados.' },
        },
      },
    },
    '/user-images': {
      get: {
        summary: 'Listar todas as imagens de usuário',
        tags: ['UserImages'],
        parameters: [
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Bearer token de ADMIN.',
          },
        ],
        responses: {
          200: { description: 'Lista de imagens (metadados).' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Sem permissão.' },
          500: { description: 'Erro ao listar.' },
        },
      },
    },
    '/user-images/{id}': {
      get: {
        summary: 'Buscar imagem por ID',
        tags: ['UserImages'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Metadados da imagem.' },
          400: { description: 'ID inválido.' },
          404: { description: 'Imagem não encontrada.' },
          500: { description: 'Erro ao buscar.' },
        },
      },
      put: {
        summary: 'Substituir imagem',
        description:
          'Envia uma nova imagem em multipart/form-data (campo `image`). Remove o arquivo antigo do disco e do backup, salva a nova imagem e atualiza o registro mantendo o mesmo ID.',
        tags: ['UserImages'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Bearer token.',
          },
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Chave opcional para reexecução segura de requisições.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Nova imagem (campo form-data `image`).',
                  },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Imagem substituída e registro atualizado com sucesso.' },
          400: { description: 'ID inválido ou nenhuma imagem enviada.' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Sem permissão.' },
          409: { description: 'Conflito de idempotência para mesma chave com payload diferente.' },
          404: { description: 'Imagem não encontrada.' },
          500: { description: 'Erro ao atualizar.' },
        },
      },
      delete: {
        summary: 'Remover imagem',
        description: 'Remove o registro e o arquivo do disco.',
        tags: ['UserImages'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Bearer token.',
          },
        ],
        responses: {
          200: { description: 'Imagem removida com sucesso.' },
          400: { description: 'ID inválido.' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Sem permissão.' },
          404: { description: 'Imagem não encontrada.' },
          500: { description: 'Erro ao remover.' },
        },
      },
    },
  },
};

