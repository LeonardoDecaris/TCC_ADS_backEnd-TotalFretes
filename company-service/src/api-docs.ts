export const apiDocs = {
  openapi: '3.0.0',
  info: { title: 'Company Service', version: '1.0.0' },
  tags: [
    { name: 'Company', description: 'Cadastro e gestão de empresas' },
    { name: 'Address', description: 'Cadastro e gestão de endereços de empresa' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check do serviço',
        tags: ['Company'],
        responses: {
          200: {
            description: 'Serviço saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    PID: { type: 'integer', example: 12345 },
                  },
                },
              },
            },
          },
        },
      },
    },
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
    '/company/me': {
      delete: {
        summary: 'Excluir a própria conta da empresa',
        description:
          'Deriva a empresa do token autenticado, bloqueia a ação quando existem fretes ativos e remove conta, imagem, endereço e empresa.',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conta da empresa removida com sucesso' },
          401: { description: 'Não autenticado' },
          404: { description: 'Empresa não encontrada' },
          409: { description: 'Exclusão bloqueada por fretes ativos' },
          500: { description: 'Erro ao excluir conta da empresa' },
        },
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
    '/company/{id}/image': {
      post: {
        summary: 'Inserir ou atualizar imagem da empresa',
        description: 'Upload multipart no campo `image` para empresa autenticada/permitida.',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Imagem atualizada' },
          201: { description: 'Imagem inserida' },
          400: { description: 'Arquivo inválido ou dados inconsistentes' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão' },
          404: { description: 'Empresa não encontrada' },
          500: { description: 'Erro ao processar imagem' },
        },
      },
      delete: {
        summary: 'Remover imagem da empresa',
        tags: ['Company'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Imagem removida com sucesso' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão' },
          404: { description: 'Imagem/empresa não encontrada' },
          500: { description: 'Erro ao remover imagem' },
        },
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
    '/company/payment-token/request': {
      post: {
        summary: 'Solicitar token para conclusão de pagamento da empresa',
        tags: ['Company'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['companyId'],
                properties: {
                  companyId: { type: 'integer', minimum: 1, example: 10 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token de pagamento gerado com sucesso' },
          400: { description: 'Dados inválidos para geração do token' },
          404: { description: 'Empresa não encontrada' },
          500: { description: 'Erro ao gerar token' },
        },
      },
    },
    '/company/complete-payment': {
      patch: {
        summary: 'Concluir pagamento/assinatura da empresa',
        description: 'Requer token válido de pagamento via middleware específico.',
        tags: ['Company'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', example: 'payment-token-value' },
                  paidAt: { type: 'string', format: 'date-time', example: '2026-06-09T18:00:00.000Z' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pagamento concluído e empresa atualizada' },
          400: { description: 'Token inválido/expirado ou payload inválido' },
          404: { description: 'Empresa não encontrada' },
          500: { description: 'Erro ao concluir pagamento' },
        },
      },
    },
    '/company/internal/{subjectId}/payment-status': {
      get: {
        summary: 'Consultar status de pagamento por subject (rota interna)',
        tags: ['Company'],
        parameters: [
          { name: 'subjectId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Status de pagamento retornado com sucesso' },
          400: { description: 'subjectId inválido' },
          404: { description: 'Empresa/subject não encontrado' },
          500: { description: 'Erro ao consultar status de pagamento' },
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
