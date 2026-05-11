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
                properties: {
                  email: { type: 'string', example: 'app@totalfretes.com.br' },
                  password: { type: 'string', example: '12345678' },
                },
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
                properties: { token: { type: 'string', example: 'token' } },
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
        responses: {
          200: { description: 'Serviço, banco e Redis ok' },
          503: { description: 'Banco e/ou Redis indisponível' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Solicitar redefinição de senha',
        description:
          'Publica envio de código por e-mail quando a conta existe. Resposta 200 genérica por segurança mesmo se o e-mail não estiver cadastrado.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Solicitação aceita (mensagem genérica)' },
          400: { description: 'Email ausente' },
          500: { description: 'Erro ao processar' },
        },
      },
    },
    '/auth/validate-code': {
      post: {
        summary: 'Validar código de recuperação',
        description: 'Consome o código único; em sucesso retorna `resetToken` para /auth/reset-password.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', description: 'Código recebido por e-mail' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Código válido; corpo inclui resetToken' },
          400: { description: 'Campos ausentes ou código inválido/expirado' },
          500: { description: 'Erro ao validar' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Definir nova senha',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resetToken', 'password'],
                properties: {
                  resetToken: { type: 'string', description: 'Token retornado por POST /auth/validate-code' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Senha alterada' },
          400: { description: 'Token/senha ausentes, senha curta ou token inválido' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro ao redefinir' },
        },
      },
    },
    '/auth/resend-code': {
      post: {
        summary: 'Reenviar código de recuperação',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Solicitação aceita (mensagem genérica)' },
          400: { description: 'Email ausente' },
          500: { description: 'Erro ao processar' },
        },
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
                  email: { type: 'string', example: 'app@totalfretes.com.br' },
                  password: { type: 'string', example: '12345678' },
                  account_type_id: { type: 'integer', example: 1 },
                  subject_id: { type: 'integer', example: 1 },
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
    '/account/subject/{id}': {
      delete: {
        summary: 'Remover conta pelo subject_id',
        description: 'Busca conta onde `subject_id` corresponde ao parâmetro. Papéis USER ou ADMIN.',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID do subject vinculado à conta (usuário ou empresa)',
          },
        ],
        responses: {
          200: { description: 'Conta removida' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro ao remover' },
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
