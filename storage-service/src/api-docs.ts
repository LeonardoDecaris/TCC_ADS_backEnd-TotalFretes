export const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Storage Service',
    version: '1.0.0',
    description: 'Microserviço para upload e persistência de metadados de imagens de usuário, empresa e carga.',
  },
  tags: [
    { name: 'StorageHealth', description: 'Rotas de infraestrutura do storage-service' },
    { name: 'UserImages', description: 'Imagens de usuário' },
    { name: 'CompanyImages', description: 'Imagens de empresa' },
    { name: 'CargoImages', description: 'Imagens de carga' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check do serviço',
        tags: ['StorageHealth'],
        responses: {
          200: {
            description: 'Serviço saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'up' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/user-images/upload': {
      post: {
        summary: 'Upload de imagem de usuário',
        description:
          'Realiza o upload de uma imagem de usuário. Aceita apenas imagens (JPEG, PNG, WEBP, GIF) de até 5MB.',
        tags: ['UserImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
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
          201: { description: 'Imagem salva com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserImageSaveResponse' } } } },
          400: {
            description: 'Requisição inválida (nenhuma imagem enviada, tipo inválido ou arquivo muito grande).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência para mesma chave com payload diferente.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/user-images': {
      get: {
        summary: 'Listar todas as imagens de usuário',
        tags: ['UserImages'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de imagens (metadados).', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserImage' } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/user-images/{id}': {
      get: {
        summary: 'Buscar imagem por ID',
        tags: ['UserImages'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Metadados da imagem.', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserImage' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      put: {
        summary: 'Substituir imagem',
        description:
          'Envia uma nova imagem em multipart/form-data (campo `image`). Remove o arquivo antigo do disco e do backup, salva a nova imagem e atualiza o registro mantendo o mesmo ID.',
        tags: ['UserImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
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
          200: { description: 'Imagem substituída e registro atualizado com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserImageSaveResponse' } } } },
          400: { description: 'ID inválido ou nenhuma imagem enviada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência para mesma chave com payload diferente.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      delete: {
        summary: 'Remover imagem',
        description: 'Remove o registro e o arquivo do disco.',
        tags: ['UserImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Imagem removida com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/company-images/upload': {
      post: {
        summary: 'Upload de imagem de empresa',
        description: 'Realiza o upload de imagem para empresa. COMPANY e ADMIN podem operar.',
        tags: ['CompanyImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'Idempotency-Key', in: 'header', required: false, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] },
            },
          },
        },
        responses: {
          201: { description: 'Imagem de empresa salva com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyImageSaveResponse' } } } },
          400: { description: 'Requisição inválida.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/company-images': {
      get: {
        summary: 'Listar todas as imagens de empresa (ADMIN)',
        tags: ['CompanyImages'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de imagens de empresa.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CompanyImage' } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/company-images/{id}': {
      get: {
        summary: 'Buscar imagem de empresa por ID',
        tags: ['CompanyImages'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Metadados da imagem.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyImage' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      put: {
        summary: 'Substituir imagem de empresa',
        tags: ['CompanyImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'Idempotency-Key', in: 'header', required: false, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] },
            },
          },
        },
        responses: {
          200: { description: 'Imagem substituída com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyImageSaveResponse' } } } },
          400: { description: 'ID inválido ou nenhuma imagem enviada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      delete: {
        summary: 'Remover imagem de empresa',
        tags: ['CompanyImages'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Imagem removida com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/cargo-images/upload': {
      post: {
        summary: 'Upload de imagem de carga',
        description: 'Realiza o upload de imagem para carga. ADMIN pode operar.',
        tags: ['CargoImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'Idempotency-Key', in: 'header', required: false, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] },
            },
          },
        },
        responses: {
          201: { description: 'Imagem de carga salva com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CargoImageSaveResponse' } } } },
          400: { description: 'Requisição inválida.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/cargo-images': {
      get: {
        summary: 'Listar todas as imagens de carga (ADMIN)',
        tags: ['CargoImages'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de imagens de carga.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CargoImage' } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/cargo-images/{id}': {
      get: {
        summary: 'Buscar imagem de carga por ID',
        tags: ['CargoImages'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Metadados da imagem.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CargoImage' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      put: {
        summary: 'Substituir imagem de carga',
        tags: ['CargoImages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'Idempotency-Key', in: 'header', required: false, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] },
            },
          },
        },
        responses: {
          200: { description: 'Imagem substituída com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/CargoImageSaveResponse' } } } },
          400: { description: 'ID inválido ou nenhuma imagem enviada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Conflito de idempotência.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      delete: {
        summary: 'Remover imagem de carga',
        tags: ['CargoImages'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Imagem removida com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
          400: { description: 'ID inválido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Imagem não encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    responses: {
      Unauthorized: {
        description: 'Token ausente ou inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      Forbidden: {
        description: 'Sem permissão para acessar o recurso',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      ServerError: {
        description: 'Erro interno do servidor',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
    },
    schemas: {
      MessageOnly: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      ErrorBody: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      UserImage: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          originalName: { type: 'string' },
          fileName: { type: 'string' },
          path: { type: 'string' },
          mimeType: { type: 'string' },
          sizeBytes: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CompanyImage: {
        allOf: [
          { $ref: '#/components/schemas/UserImage' },
          {
            type: 'object',
            properties: {
              companyId: { type: 'integer', nullable: true },
            },
          },
        ],
      },
      CargoImage: {
        allOf: [
          { $ref: '#/components/schemas/UserImage' },
        ],
      },
      UserImageSaveResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          userImage: { $ref: '#/components/schemas/UserImage' },
        },
      },
      CompanyImageSaveResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          companyImage: { $ref: '#/components/schemas/CompanyImage' },
        },
      },
      CargoImageSaveResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          cargoImage: { $ref: '#/components/schemas/CargoImage' },
        },
      },
    },
  },
};

