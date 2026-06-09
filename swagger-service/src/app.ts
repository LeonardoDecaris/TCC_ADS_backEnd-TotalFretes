import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import { logError } from '@total-fretes/logging';
import { logger, requestIdMiddleware, requestLoggerMiddleware } from '../config/logging';

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
const NOTIFICATION_SERVICE_URL =
  (process.env.NOTIFICATION_SERVICE_URL ?? 'http://notification-service:3006').replace(/\/$/, '');
const MAPBOX_SERVICE_URL =
  (process.env.MAPBOX_SERVICE_URL ?? 'http://mapbox-service:3004').replace(/\/$/, '');
const EMAIL_MANAGEMENT_SERVICE_URL =
  (process.env.EMAIL_MANAGEMENT_SERVICE_URL ?? 'http://email-management-service:3003').replace(/\/$/, '');

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
  { name: 'Notification Service', url: `${NOTIFICATION_SERVICE_URL}/api-docs` },
  { name: 'Mapbox Service', url: `${MAPBOX_SERVICE_URL}/api-docs` },
  { name: 'Email Management Service', url: `${EMAIL_MANAGEMENT_SERVICE_URL}/api-docs` },
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
      logError(logger, `Failed to fetch ${service.name}`, error, { url: service.url });
    }
  }
  return specs;
};

const app = express();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(requestIdMiddleware as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(requestLoggerMiddleware as any);

app.get('/docs', async (_req: Request, res: Response) => {
  const specs = await fetchSwaggerSpecs();

  const swaggerDocument: Record<string, unknown> = {
    openapi: '3.0.0',
    info: {
      title: 'Centralized API Documentation',
      version: '1.0.0',
    },
    servers: [
      { url: '/api', description: 'API Gateway (Nginx)' },
      { url: '/', description: 'Direct service access (dev)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
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
    security: [{ bearerAuth: [] }],
    paths: {},
  };

  specs.forEach((service) => {
    const paths = (service.spec?.paths ?? {}) as Record<string, unknown>;
    swaggerDocument.paths = {
      ...(swaggerDocument.paths as Record<string, unknown>),
      ...paths,
    };

    const components = (service.spec?.components ?? {}) as Record<string, unknown>;
    const componentSections = [
      'schemas', 'responses', 'parameters', 'requestBodies',
      'headers', 'examples', 'links', 'callbacks', 'securitySchemes',
    ] as const;

    componentSections.forEach((section) => {
      const sectionValue = components[section] as Record<string, unknown> | undefined;
      if (!sectionValue || typeof sectionValue !== 'object') return;
      const docComponents = swaggerDocument.components as Record<string, Record<string, unknown>>;
      docComponents[section] = { ...(docComponents[section] ?? {}), ...sectionValue };
    });
  });

  const docComponents = swaggerDocument.components as Record<string, Record<string, unknown>>;
  docComponents.securitySchemes ??= {};
  docComponents.securitySchemes.AcceptLanguage = {
    type: 'apiKey',
    in: 'header',
    name: 'Accept-Language',
    description: 'Idioma da resposta (ex: pt-BR, en)',
  };

  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
  Object.values((swaggerDocument.paths ?? {}) as Record<string, Record<string, unknown>>).forEach((pathItem) => {
    if (!pathItem || typeof pathItem !== 'object') return;
    httpMethods.forEach((method) => {
      const operation = pathItem[method] as Record<string, unknown> | undefined;
      if (!operation || typeof operation !== 'object') return;
      const currentSecurity = Array.isArray(operation.security) ? operation.security : [];
      const hasAcceptLanguage = currentSecurity.some(
        (item: unknown) => item && typeof item === 'object' && 'AcceptLanguage' in (item as object),
      );
      if (!hasAcceptLanguage) {
        currentSecurity.push({ AcceptLanguage: [] });
      }
      operation.security = currentSecurity;
    });
  });

  swaggerDocument.security = [{ bearerAuth: [] }, { AcceptLanguage: [] }];
  res.json(swaggerDocument);
});

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerUrl: '/docs' }));
app.get('/health', (_req, res) => res.status(200).send('ok'));

if (USER_SERVICE_URL) {
  app.use('/user', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/user', '^/(.*)': '/user/$1' } }));
  app.use('/cnh', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/cnh', '^/(.*)': '/cnh/$1' } }));
  app.use('/vehicle', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/vehicle', '^/(.*)': '/vehicle/$1' } }));
  app.use('/vehicleType', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/vehicleType', '^/(.*)': '/vehicleType/$1' } }));
  app.use('/groupVehicleType', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/groupVehicleType', '^/(.*)': '/groupVehicleType/$1' } }));
  app.use('/cnhType', createProxyMiddleware({ target: COMPANY_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/cnhType', '^/(.*)': '/cnhType/$1' } }));
}
if (COMPANY_SERVICE_URL) {
  app.use('/company', createProxyMiddleware({ target: COMPANY_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/company', '^/(.*)': '/company/$1' } }));
  app.use('/address', createProxyMiddleware({ target: COMPANY_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/address', '^/(.*)': '/address/$1' } }));
}
if (AUTH_SERVICE_URL) {
  app.use('/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/auth', '^/(.*)': '/auth/$1' } }));
  app.use('/account', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/$': '/account', '^/(.*)': '/account/$1' } }));
}
if (STORAGE_SERVICE_URL) {
  app.use('/api/user-images', createProxyMiddleware({ target: STORAGE_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/user-images': '/user-images' } }));
}

export default app;
