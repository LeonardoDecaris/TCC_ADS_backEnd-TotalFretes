import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import dotenv from 'dotenv';
import { createLogger } from '@total-fretes/observability';

dotenv.config();

const logger = createLogger(process.env.SERVICE_NAME ?? 'swagger-service');

const app = express();
const PORT = process.env.PORT ?? 3005;

const AUTH_SERVICE_URL =
  (process.env.AUTH_SERVICE_URL ?? 'http://authentication-service:3000').replace(/\/$/, '');
const COMPANY_SERVICE_URL =
  (process.env.COMPANY_SERVICE_URL ?? 'http://company-service:3002').replace(/\/$/, '');
const USER_SERVICE_URL =
  (process.env.USER_SERVICE_URL ?? 'http://user-service:3001').replace(/\/$/, '');
const STORAGE_SERVICE_URL =
  (process.env.STORAGE_SERVICE_URL ?? 'http://storage-service:3007').replace(/\/$/, '');
const FREIGHT_SERVICE_URL =
  (process.env.FREIGHT_SERVICE_URL ?? 'http://freight-service:3008').replace(/\/$/, '');

interface ServiceSpecUrl {
  name: string;
  url: string;
}

const specSources: ServiceSpecUrl[] = [
  { name: 'Authentication Service', url: `${AUTH_SERVICE_URL}/api-docs` },
  { name: 'Company Service', url: `${COMPANY_SERVICE_URL}/api-docs` },
  { name: 'User Service', url: `${USER_SERVICE_URL}/api-docs` },
  { name: 'Storage Service', url: `${STORAGE_SERVICE_URL}/api-docs` },
  { name: 'Freight Service', url: `${FREIGHT_SERVICE_URL}/api-docs` },
];

const fetchSwaggerSpecs = async (): Promise<{ name: string; spec: Record<string, unknown> }[]> => {
  const specs: { name: string; spec: Record<string, unknown> }[] = [];
  for (const service of specSources) {
    try {
      const response = await axios.get(service.url, { timeout: 8000 });
      const spec = response.data as Record<string, unknown>;
      if (spec && (spec.paths || spec.openapi || spec.swagger)) {
        specs.push({ name: service.name, spec });
        logger.info(`OK: ${service.name} (${service.url})`);
      } else {
        logger.warn(`Invalid spec from ${service.name}: response is not OpenAPI/Swagger JSON`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to fetch ${service.name} (${service.url}): ${msg}`);
    }
  }
  return specs;
};

app.get('/docs', async (_req: Request, res: Response) => {
  const specs = await fetchSwaggerSpecs();

  const swaggerDocument: any = {
    openapi: '3.0.0',
    info: {
      title: 'Centralized API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
        description: 'API Gateway (Nginx)',
      },
      {
        url: '/',
        description: 'Direct service access (dev)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {},
      responses: {},
      parameters: {},
      requestBodies: {},
      headers: {},
      examples: {},
      links: {},
      callbacks: {},
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {},
  };

  specs.forEach((service) => {
    const paths = service.spec?.paths ?? {};
    swaggerDocument.paths = { ...swaggerDocument.paths, ...paths };

    const components = (service.spec?.components ?? {}) as any;
    const componentSections = [
      'schemas',
      'responses',
      'parameters',
      'requestBodies',
      'headers',
      'examples',
      'links',
      'callbacks',
      'securitySchemes',
    ] as const;

    componentSections.forEach((section) => {
      const sectionValue = (components as any)[section] as Record<string, unknown> | undefined;
      if (!sectionValue || typeof sectionValue !== 'object') return;
      (swaggerDocument.components as any)[section] = {
        ...((swaggerDocument.components as any)[section] ?? {}),
        ...sectionValue,
      };
    });
  });

  // adiciona seletor de idioma no Authorize do Swagger UI
  swaggerDocument.components ??= {};
  swaggerDocument.components.securitySchemes ??= {};

  swaggerDocument.components.securitySchemes.AcceptLanguage = {
    type: 'apiKey',
    in: 'header',
    name: 'Accept-Language',
    description: 'Idioma da resposta (ex: pt-BR, en)',
  };

  // garante que todos os endpoints possam usar o header de idioma
  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
  Object.values(swaggerDocument.paths ?? {}).forEach((pathItem: any) => {
    if (!pathItem || typeof pathItem !== 'object') return;

    httpMethods.forEach((method) => {
      const operation = pathItem[method];
      if (!operation || typeof operation !== 'object') return;

      const currentSecurity = Array.isArray(operation.security) ? operation.security : [];
      const hasAcceptLanguage = currentSecurity.some(
        (item: any) => item && typeof item === 'object' && 'AcceptLanguage' in item
      );

      if (!hasAcceptLanguage) {
        currentSecurity.push({ AcceptLanguage: [] });
      }

      operation.security = currentSecurity;
    });
  });

  // mantém bearerAuth como segurança global e adiciona Accept-Language
  swaggerDocument.security = [{ bearerAuth: [] }, { AcceptLanguage: [] }];

  res.json(swaggerDocument);
});

app.use(
  '/swagger-ui',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerUrl: '/docs',
  })
);

app.get('/health', (_req, res) => res.status(200).send('ok'));


if (USER_SERVICE_URL) {
  app.use('/user', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/user', '^/(.*)': '/user/$1' },
  }));
  app.use('/cnh', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/cnh', '^/(.*)': '/cnh/$1' },
  }));
  app.use('/vehicle', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/vehicle', '^/(.*)': '/vehicle/$1' },
  }));
  app.use('/vehicleType', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/vehicleType', '^/(.*)': '/vehicleType/$1' },
  }));
  app.use('/groupVehicleType', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/groupVehicleType', '^/(.*)': '/groupVehicleType/$1' },
  }));
  app.use('/cnhType', createProxyMiddleware({
    target: COMPANY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/cnhType', '^/(.*)': '/cnhType/$1' },
  }));
}
if (COMPANY_SERVICE_URL) {
  app.use('/company', createProxyMiddleware({
    target: COMPANY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/company', '^/(.*)': '/company/$1' },
  }));
  app.use('/address', createProxyMiddleware({
    target: COMPANY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/address', '^/(.*)': '/address/$1' },
  }));
}
if (AUTH_SERVICE_URL) {
  app.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/auth', '^/(.*)': '/auth/$1' },
  }));
  app.use('/account', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/$': '/account', '^/(.*)': '/account/$1' },
  }));
}
if (STORAGE_SERVICE_URL) {
  app.use('/api/user-images', createProxyMiddleware({
    target: STORAGE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/user-images': '/user-images' },
  }));
}

app.listen(PORT, () => {
  logger.info(`Swagger service running at http://localhost:${PORT}`);
  logger.info(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
  logger.info(`Docs (JSON): http://localhost:${PORT}/docs`);
});