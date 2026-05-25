/**
 * OpenAPI 3.0 — documentação do Freight Service (espelha `app.ts` e `routes/*`).
 * Todas as rotas usam `authMiddleware`: envie `Authorization: Bearer <JWT>`.
 * Locale opcional: query `lang` ou `locale`, header `x-locale` ou `Accept-Language`.
 */
export const apiDocs = {
	openapi: '3.0.0',
	info: {
		title: 'Freight Service',
		version: '1.0.0',
		description:
			'Microserviço de fretes, propostas, tipos de carga e catálogos de status. ' +
			'Regras: `company_id` do frete e `driver_id` da proposta vêm do token JWT, não do body. ' +
			'Aceite de proposta: `PATCH /proposal/{id}/accept` (empresa dona do frete ou ADMIN).',
	},
	servers: [{ url: '/', description: 'Base do serviço' }],
	tags: [
		{ name: 'CargoType', description: 'Tipos de carga' },
		{ name: 'FreightStatusType', description: 'Catálogo de status de frete' },
		{ name: 'ProposalStatusType', description: 'Catálogo de status de proposta' },
		{ name: 'Freight', description: 'Fretes publicados pela empresa' },
		{ name: 'Proposal', description: 'Propostas de motoristas' },
	],
	paths: {
		'/': {
			get: {
				summary: 'Health básico do serviço',
				tags: ['Freight'],
				responses: {
					200: {
						description: 'Resposta padrão do serviço',
						content: {
							'text/plain': {
								schema: { type: 'string', example: 'Hello World!' },
							},
						},
					},
				},
			},
		},
		'/api-docs': {
			get: {
				summary: 'OpenAPI JSON do Freight Service',
				tags: ['Freight'],
				responses: {
					200: {
						description: 'Documento OpenAPI',
						content: {
							'application/json': {
								schema: { type: 'object', additionalProperties: true },
							},
						},
					},
				},
			},
		},
		'/cargo-type': {
			post: {
				summary: 'Criar tipo de carga',
				description:
					'Rotas POST/PUT/DELETE de tipo de carga exigem papel COMPANY no authorizeRoles; ADMIN também é aceito pelo mesmo middleware.',
				tags: ['CargoType'],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/CargoTypeCreate' },
						},
					},
				},
				responses: {
					201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithCargoType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			get: {
				summary: 'Listar tipos de carga',
				tags: ['CargoType'],
				security: [{ bearerAuth: [] }],
				responses: {
					200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CargoType' } } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/cargo-type/{id}': {
			get: {
				summary: 'Buscar tipo de carga por ID',
				tags: ['CargoType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Registro', content: { 'application/json': { schema: { $ref: '#/components/schemas/CargoType' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			put: {
				summary: 'Atualizar tipo de carga',
				tags: ['CargoType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					content: { 'application/json': { schema: { $ref: '#/components/schemas/CargoTypeUpdate' } } },
				},
				responses: {
					200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithCargoType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			delete: {
				summary: 'Excluir tipo de carga',
				tags: ['CargoType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Excluído', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},

		'/freight-status-type': {
			post: {
				summary: 'Criar status de frete',
				tags: ['FreightStatusType'],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusTypeNameBody' } } },
				},
				responses: {
					201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithFreightStatusType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			get: {
				summary: 'Listar status de frete',
				tags: ['FreightStatusType'],
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: 'Lista',
						content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/FreightStatusType' } } } },
					},
					401: { $ref: '#/components/responses/Unauthorized' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/freight-status-type/{id}': {
			get: {
				summary: 'Buscar status de frete por ID',
				tags: ['FreightStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Registro', content: { 'application/json': { schema: { $ref: '#/components/schemas/FreightStatusType' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			put: {
				summary: 'Atualizar status de frete',
				tags: ['FreightStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusTypeNameBodyPartial' } } },
				},
				responses: {
					200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithFreightStatusType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			delete: {
				summary: 'Excluir status de frete',
				tags: ['FreightStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Excluído', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},

		'/proposal-status-type': {
			post: {
				summary: 'Criar status de proposta',
				tags: ['ProposalStatusType'],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusTypeNameBody' } } },
				},
				responses: {
					201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposalStatusType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			get: {
				summary: 'Listar status de proposta',
				tags: ['ProposalStatusType'],
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: 'Lista',
						content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ProposalStatusType' } } } },
					},
					401: { $ref: '#/components/responses/Unauthorized' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/proposal-status-type/{id}': {
			get: {
				summary: 'Buscar status de proposta por ID',
				tags: ['ProposalStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Registro', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProposalStatusType' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			put: {
				summary: 'Atualizar status de proposta',
				tags: ['ProposalStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusTypeNameBodyPartial' } } },
				},
				responses: {
					200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposalStatusType' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			delete: {
				summary: 'Excluir status de proposta',
				tags: ['ProposalStatusType'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Excluído', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},

		'/freight': {
			post: {
				summary: 'Criar frete',
				description: '`company_id` é definido pelo token (empresa). Papel COMPANY ou ADMIN.',
				tags: ['Freight'],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { 'application/json': { schema: { $ref: '#/components/schemas/FreightCreate' } } },
				},
				responses: {
					201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithFreight' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			get: {
				summary: 'Listar fretes',
				description:
					'Sem `page`: resposta é um array de fretes (legado). Com `page` (≥1): resposta paginada `{ items, total, page, limit, hasMore }`. `limit` opcional (padrão 20, máx. 50). ADMIN: todos. COMPANY: apenas fretes da empresa.',
				tags: ['Freight'],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'page',
						in: 'query',
						required: false,
						schema: { type: 'integer', minimum: 1 },
						description: 'Se informado, ativa paginação.',
					},
					{
						name: 'limit',
						in: 'query',
						required: false,
						schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
						description: 'Tamanho da página (apenas com `page`).',
					},
				],
				responses: {
					200: {
						description: 'Lista em array (sem `page`) ou página (com `page`)',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{ type: 'array', items: { $ref: '#/components/schemas/Freight' } },
										{
											type: 'object',
											required: ['items', 'total', 'page', 'limit', 'hasMore'],
											properties: {
												items: { type: 'array', items: { $ref: '#/components/schemas/Freight' } },
												total: { type: 'integer' },
												page: { type: 'integer' },
												limit: { type: 'integer' },
												hasMore: { type: 'boolean' },
											},
										},
									],
								},
							},
						},
					},
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/freight/{id}': {
			get: {
				summary: 'Buscar frete por ID',
				tags: ['Freight'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Registro', content: { 'application/json': { schema: { $ref: '#/components/schemas/Freight' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			put: {
				summary: 'Atualizar frete',
				description: 'ADMIN ou empresa dona do frete.',
				tags: ['Freight'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					content: { 'application/json': { schema: { $ref: '#/components/schemas/FreightUpdate' } } },
				},
				responses: {
					200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithFreight' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			delete: {
				summary: 'Excluir frete',
				tags: ['Freight'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Excluído', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},

		'/proposal': {
			post: {
				summary: 'Criar proposta',
				description: '`driver_id` vem do token (motorista). Papel USER ou ADMIN.',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ProposalCreate' } } },
				},
				responses: {
					201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposal' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { description: 'Frete não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			get: {
				summary: 'Listar propostas',
				description:
					'ADMIN: todas. USER: apenas as próprias. COMPANY: propostas dos fretes da empresa. ' +
					'Sem `page`: retorna array (legado). Com `page`: retorna `{ items, total, page, limit, hasMore }`. ' +
					'Filtro principal: `proposal_status` (enviada/aceita).',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'page',
						in: 'query',
						required: false,
						description: 'Se informado, ativa paginação.',
						schema: { type: 'integer', minimum: 1 },
					},
					{
						name: 'limit',
						in: 'query',
						required: false,
						description: 'Tamanho da página (apenas com `page`).',
						schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
					},
					{
						name: 'proposal_status',
						in: 'query',
						required: false,
						description: 'Filtro de status de proposta para listagem principal.',
						schema: { type: 'string', enum: ['enviada', 'aceita'] },
					},
					{
						name: 'search',
						in: 'query',
						required: false,
						description: 'Busca por nome/rota do frete associado.',
						schema: { type: 'string' },
					},
					{
						name: 'freight_id',
						in: 'query',
						required: false,
						description: 'Filtra por ID do frete',
						schema: { type: 'integer', minimum: 1 },
					},
					{
						name: 'status',
						in: 'query',
						required: false,
						description:
							'Filtra por status. Aceita string única (`enviada`) ou CSV (`enviada,aceita`).',
						schema: {
							oneOf: [
								{ type: 'string', example: 'enviada' },
								{
									type: 'string',
									example: 'enviada,aceita',
								},
							],
						},
					},
				],
				responses: {
					200: {
						description: 'Lista (array legado ou página)',
						content: {
							'application/json': {
								schema: {
									oneOf: [
										{ type: 'array', items: { $ref: '#/components/schemas/Proposal' } },
										{
											type: 'object',
											required: ['items', 'total', 'page', 'limit', 'hasMore'],
											properties: {
												items: { type: 'array', items: { $ref: '#/components/schemas/Proposal' } },
												total: { type: 'integer' },
												page: { type: 'integer' },
												limit: { type: 'integer' },
												hasMore: { type: 'boolean' },
											},
										},
									],
								},
							},
						},
					},
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/proposal/freight-summary': {
			get: {
				summary: 'Listagem paginada de fretes com propostas agregadas',
				description:
					'Empresa ou ADMIN. Agrupa propostas por frete (ativos: exclui Cancelado, Concluido, Entregue). ' +
					'`proposal_status`: enviada (padrão) ou aceita. KPIs em `summary`.',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [
					{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
					{
						name: 'limit',
						in: 'query',
						schema: { type: 'integer', minimum: 1, maximum: 50, default: 6 },
					},
					{
						name: 'proposal_status',
						in: 'query',
						description:
							'enviada = pendentes (Enviada); aceita = Aceita. Recusada e Nao Selecionada nunca retornam.',
						schema: { type: 'string', enum: ['enviada', 'aceita'], default: 'enviada' },
					},
					{ name: 'search', in: 'query', schema: { type: 'string' } },
				],
				responses: {
					200: {
						description: 'Lista paginada',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ProposalFreightSummaryResponse' },
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
		'/proposal/{id}': {
			get: {
				summary: 'Buscar proposta por ID',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Registro', content: { 'application/json': { schema: { $ref: '#/components/schemas/Proposal' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			put: {
				summary: 'Atualizar proposta (ex.: valor)',
				description: 'Motorista dono da proposta ou ADMIN.',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					content: { 'application/json': { schema: { $ref: '#/components/schemas/ProposalUpdate' } } },
				},
				responses: {
					200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposal' } } } },
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
			delete: {
				summary: 'Excluir proposta',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				responses: {
					200: { description: 'Excluído', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageOnly' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/proposal/{id}/accept': {
			patch: {
				summary: 'Aceitar proposta',
				description:
					'Empresa dona do frete ou ADMIN. Transação: status da proposta → aceito; `freight.assignedDriver_id` e `freight.finalValue` atualizados. Body vazio `{}`.',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					required: false,
					content: {
						'application/json': {
							schema: { type: 'object', additionalProperties: false, description: 'Sem campos obrigatórios' },
						},
					},
				},
				responses: {
					200: { description: 'Aceito', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposal' } } } },
					400: { description: 'Status aceito não cadastrado (seed)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
		'/proposal/{id}/reject': {
			patch: {
				summary: 'Recusar proposta',
				description:
					'Empresa dona do frete ou ADMIN. Body vazio `{}`. ' +
					'Atualiza status da proposta para recusada.',
				tags: ['Proposal'],
				security: [{ bearerAuth: [] }],
				parameters: [{ $ref: '#/components/parameters/IdPath' }],
				requestBody: {
					required: false,
					content: {
						'application/json': {
							schema: { type: 'object', additionalProperties: false, description: 'Sem campos obrigatórios' },
						},
					},
				},
				responses: {
					200: {
						description: 'Recusada',
						content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageWithProposal' } } },
					},
					400: { $ref: '#/components/responses/BadRequest' },
					401: { $ref: '#/components/responses/Unauthorized' },
					403: { $ref: '#/components/responses/Forbidden' },
					404: { $ref: '#/components/responses/NotFound' },
					500: { $ref: '#/components/responses/ServerError' },
				},
			},
		},
	},
	components: {
		securitySchemes: {
			bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token obtido no authentication-service' },
		},
		parameters: {
			IdPath: {
				name: 'id',
				in: 'path',
				required: true,
				description: 'ID numérico',
				schema: { type: 'integer', minimum: 1 },
			},
		},
		responses: {
			BadRequest: {
				description: 'Validação Zod / body inválido',
				content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorBody' } } },
			},
			Unauthorized: {
				description: 'Token ausente ou inválido',
				content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
			},
			Forbidden: {
				description: 'Sem permissão',
				content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
			},
			NotFound: {
				description: 'Não encontrado',
				content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
			},
			ServerError: {
				description: 'Erro interno',
				content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } },
			},
		},
		schemas: {
			ErrorBody: {
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			ValidationErrorBody: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					error: { type: 'string' },
					formErrors: { type: 'array', items: { type: 'string' } },
					details: {
						type: 'object',
						additionalProperties: { type: 'array', items: { type: 'string' } },
					},
				},
			},
			MessageOnly: {
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			CargoType: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: { type: 'string' },
					vehicleType: { type: 'string' },
					imageCargo_id: { type: 'integer', nullable: true },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
			CargoTypeCreate: {
				type: 'object',
				required: ['name', 'vehicleType'],
				properties: {
					name: { type: 'string', minLength: 1 },
					vehicleType: { type: 'string', minLength: 1 },
					imageCargo_id: { type: 'integer', minimum: 1 },
				},
			},
			CargoTypeUpdate: {
				type: 'object',
				properties: {
					name: { type: 'string', minLength: 1 },
					vehicleType: { type: 'string', minLength: 1 },
					imageCargo_id: { type: 'integer', minimum: 1 },
				},
			},
			MessageWithCargoType: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					cargoType: { $ref: '#/components/schemas/CargoType' },
				},
			},
			FreightStatusType: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: { type: 'string' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
			ProposalStatusType: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: {
						type: 'string',
						enum: ['enviada', 'recusada', 'aceita', 'nao_selecionada'],
					},
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
			FreightStatusHistory: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					freight_id: { type: 'integer' },
					status_id: { type: 'integer' },
					occurred_at: { type: 'string', format: 'date-time' },
					FreightStatusType: { $ref: '#/components/schemas/FreightStatusType', nullable: true },
				},
			},
			StatusTypeNameBody: {
				type: 'object',
				required: ['name'],
				properties: {
					name: { type: 'string', minLength: 1 },
				},
			},
			StatusTypeNameBodyPartial: {
				type: 'object',
				properties: {
					name: { type: 'string', minLength: 1 },
				},
			},
			MessageWithFreightStatusType: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					freightStatusType: { $ref: '#/components/schemas/FreightStatusType' },
				},
			},
			MessageWithProposalStatusType: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					proposalStatusType: { $ref: '#/components/schemas/ProposalStatusType' },
				},
			},
			Freight: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					company_id: { type: 'integer' },
					cargoType_id: { type: 'integer' },
					name: { type: 'string', nullable: true, maxLength: 255 },
					origin_label: { type: 'string' },
					origin_lat: { type: 'number' },
					origin_lng: { type: 'number' },
					destination_label: { type: 'string' },
					destination_lat: { type: 'number' },
					destination_lng: { type: 'number' },
					status_id: { type: 'integer', nullable: true },
					assignedDriver_id: { type: 'integer', nullable: true },
					daysLimit: { type: 'integer', nullable: true },
					originalValue: { type: 'number' },
					finalValue: { type: 'number', nullable: true },
					weight: { type: 'number', nullable: true },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
					CargoType: { type: 'object', nullable: true },
					FreightStatusType: { $ref: '#/components/schemas/FreightStatusType', nullable: true },
					FreightStatusHistories: {
						type: 'array',
						items: { $ref: '#/components/schemas/FreightStatusHistory' },
					},
				},
			},
			FreightCreate: {
				type: 'object',
				required: [
					'cargoType_id',
					'name',
					'origin_label',
					'origin_lat',
					'origin_lng',
					'destination_label',
					'destination_lat',
					'destination_lng',
					'originalValue',
					'weight',
				],
				properties: {
					cargoType_id: { type: 'integer', minimum: 1 },
					name: { type: 'string', minLength: 1, maxLength: 255, description: 'Nome do frete' },
					origin_label: { type: 'string', minLength: 1 },
					origin_lat: { type: 'number', minimum: -90, maximum: 90 },
					origin_lng: { type: 'number', minimum: -180, maximum: 180 },
					destination_label: { type: 'string', minLength: 1 },
					destination_lat: { type: 'number', minimum: -90, maximum: 90 },
					destination_lng: { type: 'number', minimum: -180, maximum: 180 },
					status_id: { type: 'integer', minimum: 1 },
					daysLimit: { type: 'integer', minimum: 1 },
					originalValue: { type: 'number', minimum: 0 },
					weight: { type: 'number', minimum: 0.01, description: 'Peso da carga (kg), > 0' },
				},
			},
			FreightUpdate: {
				type: 'object',
				properties: {
					cargoType_id: { type: 'integer', minimum: 1 },
					name: { type: 'string', minLength: 1, maxLength: 255 },
					origin_label: { type: 'string', minLength: 1 },
					origin_lat: { type: 'number', minimum: -90, maximum: 90 },
					origin_lng: { type: 'number', minimum: -180, maximum: 180 },
					destination_label: { type: 'string', minLength: 1 },
					destination_lat: { type: 'number', minimum: -90, maximum: 90 },
					destination_lng: { type: 'number', minimum: -180, maximum: 180 },
					status_id: { type: 'integer', minimum: 1 },
					daysLimit: { type: 'integer', minimum: 1 },
					originalValue: { type: 'number', minimum: 0 },
					weight: { type: 'number', minimum: 0.01, description: 'Peso da carga (kg), > 0' },
				},
			},
			MessageWithFreight: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					freight: { $ref: '#/components/schemas/Freight' },
				},
			},
			Proposal: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					freight_id: { type: 'integer' },
					driver_id: { type: 'integer' },
					status_id: { type: 'integer', nullable: true },
					value: { type: 'number' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
					Freight: { $ref: '#/components/schemas/Freight', nullable: true },
					ProposalStatusType: { $ref: '#/components/schemas/ProposalStatusType', nullable: true },
				},
			},
			ProposalCreate: {
				type: 'object',
				required: ['freight_id', 'value'],
				properties: {
					freight_id: { type: 'integer', minimum: 1 },
					value: { type: 'number', minimum: 0 },
				},
			},
			ProposalUpdate: {
				type: 'object',
				properties: {
					value: { type: 'number', minimum: 0 },
				},
			},
			MessageWithProposal: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					proposal: { $ref: '#/components/schemas/Proposal' },
				},
			},
			ProposalFreightSummaryItem: {
				type: 'object',
				properties: {
					freight: { $ref: '#/components/schemas/Freight' },
					proposalCount: { type: 'integer' },
					pendingCount: { type: 'integer' },
					bestValue: { type: 'number' },
					averageValue: { type: 'number' },
					referenceValue: { type: 'number' },
				},
			},
			ProposalFreightSummaryKpis: {
				type: 'object',
				properties: {
					freightsWithProposals: { type: 'integer' },
					totalProposals: { type: 'integer' },
					pendingProposals: { type: 'integer' },
					acceptedProposals: { type: 'integer' },
					freightsInNegotiation: { type: 'integer' },
				},
			},
			ProposalFreightSummaryResponse: {
				type: 'object',
				properties: {
					items: {
						type: 'array',
						items: { $ref: '#/components/schemas/ProposalFreightSummaryItem' },
					},
					total: { type: 'integer' },
					page: { type: 'integer' },
					limit: { type: 'integer' },
					hasMore: { type: 'boolean' },
					summary: { $ref: '#/components/schemas/ProposalFreightSummaryKpis' },
				},
			},
		},
	},
} as const;
