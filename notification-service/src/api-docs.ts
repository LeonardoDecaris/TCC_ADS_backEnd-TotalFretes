export const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Notification Service',
    version: '1.0.0',
    description: 'Serviço responsável por consulta de notificações não lidas e marcação de leitura.',
  },
  tags: [
    { name: 'NotificationHealth', description: 'Rotas de infraestrutura do notification-service' },
    { name: 'Notifications', description: 'Consulta e atualização de notificações' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check do serviço',
        tags: ['NotificationHealth'],
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
                    onlineUsers: { type: 'integer', example: 10 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/notifications/{userId}': {
      get: {
        summary: 'Listar notificações não lidas de um usuário',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Lista de notificações',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Notification' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        summary: 'Marcar notificação como lida',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Notificação atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notification' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
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
        description: 'Parâmetros inválidos',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      Unauthorized: {
        description: 'Token ausente ou inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      Forbidden: {
        description: 'Sem permissão para acessar o recurso',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
      },
      NotFound: {
        description: 'Notificação não encontrada',
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
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          type: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          metadata: { type: 'object', nullable: true, additionalProperties: true },
          read_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};
