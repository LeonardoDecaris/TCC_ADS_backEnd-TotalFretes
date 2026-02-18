import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

interface Service {
  name: string;
  url: string;
}

// URLs via env para funcionar no Docker (nomes dos serviços) e local (localhost)
const services: Service[] = [
  { name: 'Authentication Service', url: (process.env.AUTH_SERVICE_URL) + '/api-docs' },
  { name: 'Company Service', url: (process.env.COMPANY_SERVICE_URL) + '/api-docs' },
  { name: 'User Service', url: (process.env.USER_SERVICE_URL) + '/api-docs' },
];

// Fetch Swagger specs from all services
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

app.get('/docs', async (req: Request, res: Response) => {
  const specs = await fetchSwaggerSpecs();
  const swaggerDocument: any = {
    openapi: '3.0.0',
    info: {
      title: 'Centralized API Documentation',
      version: '1.0.0',
    },
    paths: {},
  };

  specs.forEach((service) => {
    const paths = service.spec?.paths ?? {};
    swaggerDocument.paths = { ...swaggerDocument.paths, ...paths };
  });

  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/docs' }));

app.get('/health', (_req, res) => res.status(200).send('ok'));

app.listen(PORT, () => {
  console.log(`Swagger service running at http://localhost:${PORT}`);
  console.log('  Swagger UI: http://localhost:' + PORT + '/swagger-ui');
  console.log('  Docs (JSON): http://localhost:' + PORT + '/docs');
  console.log('  Garanta que os serviços estão rodando: Auth=3001, Company=3002, User=3003');
});