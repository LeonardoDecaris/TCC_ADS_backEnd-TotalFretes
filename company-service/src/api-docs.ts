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
                  cnpj: {
                    type: 'string',
                    description:
                      'CNPJ conforme IN RFB 2.229/2024 (14 caracteres; dígitos e/ou letras A–Z após normalização no backend).',
                  },
                  email: { type: 'string' },
                  phoneNumber: { type: 'string' },
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
                  cnpj: {
                    type: 'string',
                    description:
                      'CNPJ conforme IN RFB 2.229/2024 (14 caracteres; dígitos e/ou letras A–Z após normalização no backend).',
                  },
                  email: { type: 'string' },
                  phoneNumber: { type: 'string' },
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
    '/company/end-account': {
      post: {
        summary: 'Criar empresa com endereço e conta de acesso',
        tags: ['Company'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'name',
                  'email',
                  'birthFundation',
                  'phoneNumber',
                  'cnpj',
                  'country',
                  'cep',
                  'street',
                  'district',
                  'number',
                  'city',
                  'state',
                  'password',
                  'account_type_id',
                ],
                properties: {
                  name: { type: 'string', example: 'Transportes Decaris LTDA' },
                  email: { type: 'string', format: 'email', example: 'empresa@totalfretes.com' },
                  birthFundation: { type: 'string', example: '2020-05-15' },
                  phoneNumber: { type: 'string', example: '11987654321' },
                  website: { type: 'string', format: 'uri', example: 'https://empresa.com.br' },
                  cnpj: {
                    type: 'string',
                    description:
                      'CNPJ conforme IN RFB 2.229/2024 (14 caracteres; dígitos e/ou letras A–Z após normalização no backend).',
                    example: '11444777000161',
                  },
                  country: {
                    type: 'string',
                    description: 'Código do país usado no endereço. Ex.: BR, US, PT.',
                    example: 'BR',
                  },
                  cep: { type: 'string', example: '01310100' },
                  street: { type: 'string', example: 'Avenida Paulista' },
                  district: { type: 'string', example: 'Bela Vista' },
                  number: { type: 'string', example: '1000' },
                  city: { type: 'string', example: 'São Paulo' },
                  state: { type: 'string', example: 'SP' },
                  password: { type: 'string', format: 'password', example: 'Teste1234' },
                  account_type_id: { type: 'number', example: 2 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Empresa, endereço e conta criados' },
          409: { description: 'Empresa já cadastrada' },
          500: { description: 'Erro ao criar empresa com conta' },
        },
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
                required: ['country', 'cep', 'street', 'district', 'number', 'city', 'state'],
                properties: {
                  country: {
                    type: 'string',
                    description: 'Código do país do endereço. Ex.: BR, US, PT.',
                    example: 'BR',
                  },
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
                  country: {
                    type: 'string',
                    description: 'Código do país do endereço. Ex.: BR, US, PT.',
                    example: 'BR',
                  },
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
