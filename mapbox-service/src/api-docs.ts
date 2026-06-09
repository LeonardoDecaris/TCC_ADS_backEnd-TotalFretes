export const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Mapbox Service',
    version: '1.0.0',
    description: 'Serviço de rotas, geocodificação e telemetria de localização do motorista.',
  },
  tags: [
    { name: 'MapboxHealth', description: 'Rotas de infraestrutura do mapbox-service' },
    { name: 'Routing', description: 'Rotas e geocodificação' },
    { name: 'Telemetry', description: 'Ingestão e consulta de trilha de localização' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check do serviço',
        tags: ['MapboxHealth'],
        responses: {
          200: {
            description: 'Serviço saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/rota-frete': {
      get: {
        summary: 'Calcular rota de frete',
        tags: ['Routing'],
        parameters: [
          { name: 'moradaDestino', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'moradaCarga', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'coordenadasOrigem', in: 'query', required: false, schema: { type: 'string', example: '-49.2733,-25.4284' } },
          { name: 'coordenadasMotorista', in: 'query', required: false, schema: { type: 'string', example: '-49.2500,-25.4400' } },
        ],
        responses: {
          200: {
            description: 'Rota calculada',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/geocode-forward': {
      get: {
        summary: 'Geocodificação forward (texto para coordenadas)',
        tags: ['Routing'],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 } },
        ],
        responses: {
          200: {
            description: 'Dados de geocodificação',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/geocode-reverse': {
      get: {
        summary: 'Geocodificação reverse (coordenadas para endereço)',
        tags: ['Routing'],
        parameters: [
          { name: 'lng', in: 'query', required: true, schema: { type: 'number', minimum: -180, maximum: 180 } },
          { name: 'lat', in: 'query', required: true, schema: { type: 'number', minimum: -90, maximum: 90 } },
        ],
        responses: {
          200: {
            description: 'Dados de geocodificação',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { description: 'Endereço não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/telemetry/location': {
      post: {
        summary: 'Publicar localização do motorista para um frete',
        tags: ['Telemetry'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IngestLocationInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Localização registrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    freightId: { type: 'integer' },
                    point: { type: 'object', additionalProperties: true },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Frete não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/telemetry/trail/{freightId}': {
      get: {
        summary: 'Consultar trilha de localização de um frete',
        tags: ['Telemetry'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'freightId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Trilha de localização',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    freightId: { type: 'integer' },
                    points: { type: 'array', items: { type: 'object', additionalProperties: true } },
                    latest: { type: 'object', nullable: true, additionalProperties: true },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Frete não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
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
      BadRequest: {
        description: 'Parâmetros ou payload inválidos',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      Unauthorized: {
        description: 'Token ausente ou inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      Forbidden: {
        description: 'Sem permissão para o recurso solicitado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      ServerError: {
        description: 'Erro interno do servidor',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
    },
    schemas: {
      ErrorBody: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
          requestId: { type: 'string' },
          errorId: { type: 'string' },
        },
      },
      IngestLocationInput: {
        type: 'object',
        required: ['freightId', 'latitude', 'longitude'],
        properties: {
          freightId: { type: 'integer', minimum: 1 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          speed: { type: 'number', minimum: 0, nullable: true },
          heading: { type: 'number', minimum: 0, maximum: 360, nullable: true },
          recordedAt: { type: 'string' },
        },
      },
    },
  },
};
