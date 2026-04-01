export const apiDocs = {
  openapi: '3.0.0',
  info: { title: 'Company Service', version: '1.0.0' },
  paths: {
    '/company': {
      post: {
        summary: 'Criar empresa',
        tags: ['Company'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  cnpj: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Empresa criada' }, 500: { description: 'Erro ao criar' } },
      },
      get: {
        summary: 'Listar empresas (ADMIN)',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de empresas' }, 500: { description: 'Erro ao buscar' } },
      },
    },
    '/company/{id}': {
      get: {
        summary: 'Buscar empresa por ID',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Empresa' }, 404: { description: 'Não encontrada' } },
      },
      put: {
        summary: 'Atualizar empresa',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  cnpj: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Empresa atualizada' }, 404: { description: 'Não encontrada' } },
      },
      delete: {
        summary: 'Deletar empresa',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Empresa deletada' }, 404: { description: 'Não encontrada' } },
      },
    },
    '/address': {
      post: {
        summary: 'Criar endereço da empresa (empresa)',
        tags: ['Address'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cep', 'street', 'district', 'number', 'city', 'state'],
                properties: {
                  cep: { type: 'string' },
                  street: { type: 'string' },
                  district: { type: 'string' },
                  number: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Endereço criado' }, 500: { description: 'Erro' } },
      },
      get: {
        summary: 'Listar endereços (empresa/admin)',
        tags: ['Address'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de endereços' }, 500: { description: 'Erro' } },
      },
    },
    '/address/{id}': {
      get: {
        summary: 'Buscar endereço por ID',
        tags: ['Address'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Endereço' }, 404: { description: 'Não encontrado' } },
      },
      put: {
        summary: 'Atualizar endereço',
        tags: ['Address'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cep: { type: 'string' },
                  street: { type: 'string' },
                  district: { type: 'string' },
                  number: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Endereço atualizado' }, 404: { description: 'Não encontrado' } },
      },
      delete: {
        summary: 'Deletar endereço',
        tags: ['Address'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Endereço deletado' }, 404: { description: 'Não encontrado' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
