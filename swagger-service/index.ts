import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL?.replace(/\/$/, '');
const COMPANY_SERVICE_URL = process.env.COMPANY_SERVICE_URL?.replace(/\/$/, '');
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL?.replace(/\/$/, '');

interface Service {
  name: string;
  url: string;
}

const services: Service[] = [
  { name: 'Authentication Service', url: (process.env.AUTH_SERVICE_URL) + '/api-docs' },
  { name: 'Company Service', url: (process.env.COMPANY_SERVICE_URL) + '/api-docs' },
  { name: 'User Service', url: (process.env.USER_SERVICE_URL) + '/api-docs' },
];

const fetchSwaggerSpecs = async (): Promise<{ name: string; spec: any }[]> => {
  const specs: { name: string; spec: any }[] = [];
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      const spec = response.data;
      if (spec && (spec.paths || spec.openapi || spec.swagger)) {
        specs.push({ name: service.name, spec });
        console.log(`OK: ${service.name} (${service.url})`);
      } else {
        console.warn(`Invalid spec from ${service.name}: response is not OpenAPI/Swagger JSON`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to fetch ${service.name} (${service.url}): ${msg}`);
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

app.listen(PORT, () => {
  console.log(`Swagger service running at http://localhost:${PORT}`);
  console.log('  Swagger UI: http://localhost:' + PORT + '/swagger-ui');
  console.log('  Docs (JSON): http://localhost:' + PORT + '/docs');
  console.log('  Garanta que os serviços estão rodando: Auth=3001, Company=3002, User=3003');
});