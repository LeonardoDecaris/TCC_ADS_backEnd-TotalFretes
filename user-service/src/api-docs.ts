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
                  userImage_id: { type: 'number' },
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
                  userImage_id: { type: 'number' },
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
                  birthDate: { type: 'string', format: 'date' },
                  phoneNumber: { type: 'string' },
                  cpf: { type: 'string' },
                  sex: { type: 'string' },
                  useGlasses: { type: 'boolean' },
                  isDeficient: { type: 'boolean' },
                  cnhNumber: { type: 'string' },
                  cnhType_id: { type: 'number' },
                  vehicleType_id: { type: 'number' },
                  userImage_id: { type: 'number' },
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
                  nome: { type: 'string' },
                  cnhType_id: { type: 'number' },
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
                  plateNumber: { type: 'string' },
                  chassisNumber: { type: 'string' },
                  city: { type: 'string' },
                  stateUF: { type: 'string' },
                  country: { type: 'string' },
                  vehicleType_id: { type: 'number' },
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
                  plateNumber: { type: 'string' },
                  chassisNumber: { type: 'string' },
                  city: { type: 'string' },
                  stateUF: { type: 'string' },
                  country: { type: 'string' },
                  vehicleType_id: { type: 'number' },
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
