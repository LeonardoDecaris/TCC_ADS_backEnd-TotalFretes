export const apiDocs = {
  openapi: '3.0.0',
  info: { title: 'User Service', version: '1.0.0' },
  paths: {
    '/user': {
      post: {
        summary: 'Criar usuário',
        tags: ['User'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  birthDate: { type: 'string', format: 'date' },
                  phoneNumber: { type: 'string' },
                  cpf: { type: 'string' },
                  sex: { type: 'string' },
                  useGlasses: { type: 'boolean' },
                  isDeficient: { type: 'boolean' },
                  cnhNumber: { type: 'string' },
                  cnhType_id: { type: 'number' },
                  vehicleType_id: { type: 'number' },
                  userImage_id: { type: 'number', nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Usuário criado' }, 500: { description: 'Erro ao criar' } },
      },
      get: {
        summary: 'Listar usuários (ADMIN)',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de usuários' }, 500: { description: 'Erro ao buscar' } },
      },
    },
    '/user/end-account': {
      post: {
        summary: 'Criar usuário e conta',
        tags: ['User'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  birthDate: { type: 'string', format: 'date' },
                  phoneNumber: { type: 'string' },
                  cpf: { type: 'string' },
                  sex: { type: 'string' },
                  useGlasses: { type: 'boolean' },
                  isDeficient: { type: 'boolean' },
                  cnhNumber: { type: 'string' },
                  cnhType_id: { type: 'number' },
                  vehicleType_id: { type: 'number' },
                  userImage_id: { type: 'number', nullable: true },
                  password: { type: 'string' },
                  account_type_id: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário e conta criada com sucesso' },
          502: { description: 'Usuário criado, mas falhou ao criar conta no auth-service' },
          500: { description: 'Erro ao criar usuário e conta' },
        },
      },
    },
    '/user/{id}': {
      get: {
        summary: 'Buscar usuário por ID',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Usuário' }, 404: { description: 'Não encontrado' } },
      },
      put: {
        summary: 'Atualizar usuário',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Usuário atualizado' }, 404: { description: 'Não encontrado' } },
      },
      delete: {
        summary: 'Deletar usuário',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Usuário deletado' }, 404: { description: 'Não encontrado' } },
      },
    },
    '/cnh': {
      post: {
        summary: 'Criar tipo de CNH (ADMIN)',
        tags: ['CNH'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Tipo CNH criado' }, 500: { description: 'Erro' } },
      },
      get: {
        summary: 'Listar tipos de CNH (ADMIN)',
        tags: ['CNH'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de tipos' }, 500: { description: 'Erro' } },
      },
    },
    '/cnh/{id}': {
      get: {
        summary: 'Buscar tipo CNH por ID',
        tags: ['CNH'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Tipo CNH' }, 404: { description: 'Não encontrado' } },
      },
      put: {
        summary: 'Atualizar tipo CNH',
        tags: ['CNH'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Tipo atualizado' }, 404: { description: 'Não encontrado' } },
      },
      delete: {
        summary: 'Deletar tipo CNH',
        tags: ['CNH'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Tipo deletado' }, 404: { description: 'Não encontrado' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
