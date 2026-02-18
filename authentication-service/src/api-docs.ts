export const apiDocs = {
  openapi: '3.0.0',
  info: { title: 'Authentication Service', version: '1.0.0' },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Token e dados do usuário' }, 401: { description: 'Credenciais inválidas' } },
      },
    },
    '/auth/validate': {
      post: {
        summary: 'Validar token',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { token: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Token válido' }, 401: { description: 'Token inválido' } },
      },
    },
    '/auth/verify-token': {
      get: {
        summary: 'Verificar token (requer Bearer)',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dados do usuário' }, 401: { description: 'Não autenticado' } },
      },
    },
    '/auth/health': {
      get: {
        summary: 'Health check',
        tags: ['Auth'],
        responses: { 200: { description: 'Serviço e banco ok' }, 503: { description: 'Banco indisponível' } },
      },
    },
    '/account': {
      post: {
        summary: 'Criar conta',
        tags: ['Account'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  account_type_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Conta criada' }, 400: { description: 'Dados inválidos' }, 409: { description: 'Email já existe' } },
      },
    },
    '/account/types': {
      get: {
        summary: 'Listar tipos de conta',
        tags: ['Account'],
        responses: { 200: { description: 'Lista de tipos' } },
      },
    },
    '/account/{id}': {
      get: {
        summary: 'Buscar conta por ID (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Conta' }, 404: { description: 'Não encontrada' } },
      },
      delete: {
        summary: 'Remover conta (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Removida' }, 404: { description: 'Não encontrada' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
