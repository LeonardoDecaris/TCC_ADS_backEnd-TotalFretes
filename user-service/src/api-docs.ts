export const apiDocs = {
  openapi: '3.0.0',
  info: { title: 'User Service', version: '1.0.0' },
  tags: [
    { name: 'User', description: 'Cadastro e gestão de usuários (user-service)' },
    { name: 'CNH', description: 'CNH / carteira de motorista (user-service)' },
    { name: 'GroupVehicleType', description: 'Grupos de tipo de veículo (user-service)' },
    { name: 'VehicleType', description: 'Tipos de veículo (user-service)' },
    { name: 'Vehicle', description: 'Veículos do motorista (user-service)' },
  ],
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
                  name: { type: 'string', example: 'Total Fretes app' },
                  email: { type: 'string', example: 'app@totalfretes.com.br' },
                  birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
                  phoneNumber: { type: 'string', example: '44999927372' },
                  cpf: { type: 'string', example: '83841575021' },
                  sex: { type: 'string', example: 'M' },
                  useGlasses: { type: 'boolean', example: false },
                  isDeficient: { type: 'boolean', example: false },
                  cnhNumber: { type: 'string', example: '36079305308' },
                  issuingAgencyCnh: { type: 'string', example: 'PR' },
                  cnhType_id: { type: 'number', example: 1 },
                  vehicleType_id: { type: 'number', example: 0 },
                  userImage_id: { type: 'number', example: 0 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado' },
          400: { description: 'Erro de validação dos dados enviados (retorna status no body)' },
          409: { description: 'Conflito de unicidade em email/phoneNumber/cpf/cnhNumber (retorna conflicts e status no body)' },
          500: { description: 'Erro ao criar (retorna status no body)' },
        },
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
                required: [
                  'name',
                  'email',
                  'birthDate',
                  'phoneNumber',
                  'cpf',
                  'sex',
                  'useGlasses',
                  'isDeficient',
                  'cnhNumber',
                  'cnhType_id',
                  'password',
                  'account_type_id',
                ],
                properties: {
                  name: { type: 'string', example: 'Total Fretes app' },
                  email: { type: 'string', example: 'app@totalfretes.com.br' },
                  birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
                  phoneNumber: { type: 'string', example: '44999927372' },
                  cpf: { type: 'string', example: '83841575021' },
                  sex: { type: 'string', example: 'M' },
                  useGlasses: { type: 'boolean', example: false },
                  isDeficient: { type: 'boolean', example: false },
                  cnhNumber: { type: 'string', example: '36079305308' },
                  issuingAgencyCnh: { type: 'string', example: 'PR' },
                  cnhType_id: { type: 'number', example: 3 },
                  vehicleType_id: { type: 'number', example: 0 },
                  userImage_id: { type: 'number', example: 0 },
                  password: { type: 'string', example: '12345678' },
                  account_type_id: { type: 'number', example: 1 },
                },
              },
              example: {
                name: 'Total Fretes app',
                email: 'app@totalfretes.com.br',
                birthDate: '1990-01-01',
                phoneNumber: '44999927372',
                cpf: '83841575021',
                sex: 'M',
                useGlasses: false,
                isDeficient: false,
                cnhNumber: '36079305308',
                issuingAgencyCnh: 'PR',
                cnhType_id: 3,
                vehicleType_id: 1,
                userImage_id: 1,
                password: '12345678',
                account_type_id: 1,
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário e conta criada com sucesso' },
          400: { description: 'Erro de validação dos dados enviados' },
          409: { description: 'Já existe usuário/conta para o e-mail informado' },
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
                  name: { type: 'string', example: 'Total Fretes app' },
                  email: { type: 'string', example: 'app@totalfretes.com.br' },
                  birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
                  phoneNumber: { type: 'string', example: '44999927372' },
                  cpf: { type: 'string', example: '83841575021' },
                  sex: { type: 'string', example: 'M' },
                  useGlasses: { type: 'boolean', example: false },
                  isDeficient: { type: 'boolean', example: false },
                  cnhNumber: { type: 'string', example: '36079305308' },
                  issuingAgencyCnh: { type: 'string', example: 'PR' },
                  cnhType_id: { type: 'number', example: 3 },
                  vehicleType_id: { type: 'number', example: 0 },
                  userImage_id: { type: 'number', example: 0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Usuário atualizado' },
          400: { description: 'Erro de validação dos dados enviados (retorna status no body)' },
          404: { description: 'Não encontrado' },
          409: { description: 'Conflito de unicidade em email/phoneNumber/cpf/cnhNumber (retorna conflicts e status no body)' },
          500: { description: 'Erro ao atualizar (retorna status no body)' },
        },
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
                  type: { type: 'string', example: 'A' },
                  description: { type: 'string', example: 'Categoria A' },
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
                  type: { type: 'string', example: 'A' },
                  description: { type: 'string', example: 'Categoria A' },
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

    '/group-vehicle-type': {
      post: {
        summary: 'Criar grupo de tipo de veículo (ADMIN)',
        tags: ['GroupVehicleType'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string', example: 'Caminhão' },
                  cnhType_id: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Grupo de tipo de veículo criado' },
          500: { description: 'Erro ao criar' },
        },
      },
      get: {
        summary: 'Listar grupos de tipos de veículo (ADMIN)',
        tags: ['GroupVehicleType'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de grupos' },
          500: { description: 'Erro ao buscar' },
        },
      },
    },
    '/group-vehicle-type/{id}': {
      get: {
        summary: 'Buscar grupo de tipo de veículo por ID',
        tags: ['GroupVehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Grupo de tipo de veículo' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        summary: 'Atualizar grupo de tipo de veículo',
        tags: ['GroupVehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  cnhType_id: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Grupo atualizado' },
          404: { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Deletar grupo de tipo de veículo',
        tags: ['GroupVehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Grupo deletado' },
          404: { description: 'Não encontrado' },
        },
      },
    },

    '/vehicle-type': {
      post: {
        summary: 'Criar tipo de veículo (ADMIN)',
        tags: ['VehicleType'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string', example: 'Caminhão' },
                  axes: { type: 'number', example: 2 },
                  weight: { type: 'number', example: 10000 },
                  capacityWeight: { type: 'number', example: 10000 },
                  length: { type: 'number', example: 10000 },
                  imageVehicle_id: { type: 'number', example: 0 },
                  groupVehicleType_id: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tipo de veículo criado' },
          500: { description: 'Erro ao criar' },
        },
      },
      get: {
        summary: 'Listar tipos de veículo (ADMIN)',
        tags: ['VehicleType'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de tipos de veículo' },
          500: { description: 'Erro ao buscar' },
        },
      },
    },
    '/vehicle-type/{id}': {
      get: {
        summary: 'Buscar tipo de veículo por ID',
        tags: ['VehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Tipo de veículo' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        summary: 'Atualizar tipo de veículo',
        tags: ['VehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  axes: { type: 'number' },
                  weight: { type: 'number' },
                  capacityWeight: { type: 'number' },
                  length: { type: 'number' },
                  imageVehicle_id: { type: 'number' },
                  groupVehicleType_id: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tipo de veículo atualizado' },
          404: { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Deletar tipo de veículo',
        tags: ['VehicleType'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Tipo de veículo deletado' },
          404: { description: 'Não encontrado' },
        },
      },
    },

    '/vehicle': {
      post: {
        summary: 'Criar veículo (ADMIN)',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plateNumber: { type: 'string', example: 'ABC1234' },
                  chassisNumber: { type: 'string', example: '1234567890' },
                  model: { type: 'string', example: 'Mercedes-Benz' },
                  mark: { type: 'string', example: 'Mercedes-Benz' },
                  city: { type: 'string', example: 'Curitiba' },
                  stateUF: { type: 'string', example: 'PR' },
                  country: { type: 'string', example: 'Brasil' },
                  vehicleType_id: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Veículo criado' },
          500: { description: 'Erro ao criar' },
        },
      },
      get: {
        summary: 'Listar veículos (ADMIN)',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de veículos' },
          500: { description: 'Erro ao buscar' },
        },
      },
    },
    '/vehicle/register': {
      post: {
        summary: 'Criar veículo e vincular ao usuário autenticado',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plateNumber: { type: 'string', example: 'ABC1234' },
                  chassisNumber: { type: 'string', example: '1234567890' },
                  model: { type: 'string', example: 'Mercedes-Benz' },
                  mark: { type: 'string', example: 'Mercedes-Benz' },
                  city: { type: 'string', example: 'Curitiba' },
                  stateUF: { type: 'string', example: 'PR' },
                  country: { type: 'string', example: 'Brasil' },
                  vehicleType_id: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Veículo criado e vinculado ao usuário' },
          401: { description: 'Não autenticado' },
          404: { description: 'Usuário não encontrado' },
          500: { description: 'Erro ao criar/vincular' },
        },
      },
    },
    '/vehicle/{id}': {
      get: {
        summary: 'Buscar veículo por ID',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Veículo' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        summary: 'Atualizar veículo',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plateNumber: { type: 'string', example: 'ABC1234' },
                  chassisNumber: { type: 'string', example: '1234567890' },
                  model: { type: 'string', example: 'Mercedes-Benz' },
                  mark: { type: 'string', example: 'Mercedes-Benz' },
                  city: { type: 'string', example: 'Curitiba' },
                  stateUF: { type: 'string', example: 'PR' },
                  country: { type: 'string', example: 'Brasil' },
                  vehicleType_id: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Veículo atualizado' },
          404: { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Deletar veículo',
        tags: ['Vehicle'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Veículo deletado' },
          404: { description: 'Não encontrado' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
