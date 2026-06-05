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
    '/auth/change-password': {
      patch: {
        summary: 'Trocar senha autenticado',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Senha alterada com sucesso' },
          400: { description: 'Campos inválidos, senha curta ou senha repetida' },
          401: { description: 'Senha atual inválida ou token ausente' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro ao trocar senha' },
        },
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
        summary: 'Criar conta (cadastro público)',
        tags: ['Account'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Conta criada' },
          400: { description: 'Dados inválidos' },
          409: { description: 'Email já existe' },
        },
      },
      get: {
        summary: 'Listar contas (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountList' } } },
          },
          403: { description: 'Acesso negado' },
        },
      },
    },
    '/account/admin': {
      post: {
        summary: 'Criar conta ADMIN',
        description:
          'Cria uma conta com perfil ADMIN. Requer token ADMIN. O `subject_id` é definido automaticamente como o id da conta (auto-referência).',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountAdminCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Administrador criado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    account: { $ref: '#/components/schemas/Account' },
                  },
                },
              },
            },
          },
          409: { description: 'Email já existe' },
          403: { description: 'Acesso negado' },
        },
      },
    },
    '/account/types': {
      get: {
        summary: 'Listar tipos de conta',
        tags: ['Account'],
        responses: {
          200: {
            description: 'Lista de tipos (USER, COMPANY, ADMIN)',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AccountType' } },
              },
            },
          },
        },
      },
    },
    '/account/subject/{subjectId}': {
      get: {
        summary: 'Buscar conta por subject_id (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'subjectId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do subject (usuário, empresa ou id da própria conta ADMIN)',
          },
        ],
        responses: {
          200: {
            description: 'Conta encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Account' } } },
          },
          404: { description: 'Não encontrada' },
        },
      },
      delete: {
        summary: 'Remover conta pelo subject_id',
        description: 'Permitido para o próprio dono do subject ou ADMIN.',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'subjectId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do subject vinculado à conta',
          },
        ],
        responses: {
          200: { description: 'Conta removida' },
          404: { description: 'Conta não encontrada' },
        },
      },
    },
    '/account/{id}': {
      get: {
        summary: 'Buscar conta por ID (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Conta',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Account' } } },
          },
          404: { description: 'Não encontrada' },
        },
      },
      patch: {
        summary: 'Atualizar conta (ADMIN)',
        description: 'Ao promover para ADMIN, `subject_id` é ajustado para o id da conta.',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountPatch' },
            },
          },
        },
        responses: {
          200: { description: 'Conta atualizada' },
          404: { description: 'Não encontrada' },
          409: { description: 'Email já existe' },
        },
      },
      delete: {
        summary: 'Remover conta (ADMIN)',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Removida' }, 404: { description: 'Não encontrada' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      AccountType: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', enum: ['USER', 'COMPANY', 'ADMIN'] },
        },
      },
      Account: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          account_type_id: { type: 'integer' },
          subject_id: { type: 'integer' },
          AccountType: { $ref: '#/components/schemas/AccountType' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AccountCreate: {
        type: 'object',
        required: ['email', 'password', 'account_type_id', 'subject_id'],
        properties: {
          email: { type: 'string', format: 'email', example: 'app@totalfretes.com.br' },
          password: { type: 'string', minLength: 8, example: '12345678' },
          account_type_id: { type: 'integer', example: 2 },
          subject_id: { type: 'integer', example: 1 },
        },
      },
      AccountAdminCreate: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin2@totalfretes.com.br' },
          password: { type: 'string', minLength: 8, example: 'Admin@123456' },
        },
      },
      AccountPatch: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          account_type_id: { type: 'integer' },
        },
      },
      AccountList: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Account' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          hasMore: { type: 'boolean' },
        },
      },
    },
  },
};
