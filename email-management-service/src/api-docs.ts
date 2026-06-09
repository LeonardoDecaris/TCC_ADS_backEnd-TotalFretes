export const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Email Management Service',
    version: '1.0.0',
    description: 'Serviço de gestão de envio de e-mails (consumo assíncrono) com endpoint de saúde.',
  },
  tags: [
    { name: 'EmailHealth', description: 'Rotas de infraestrutura do email-management-service' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check do serviço',
        tags: ['EmailHealth'],
        responses: {
          200: {
            description: 'Serviço saudável',
            content: {
              'text/plain': {
                schema: { type: 'string', example: 'OK' },
              },
            },
          },
        },
      },
    },
  },
};
