FROM node:22-slim AS build

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/company-service
COPY company-service/package.json company-service/tsconfig.json ./
COPY company-service/src ./src
RUN npm install

EXPOSE 3002

CMD [ "npm", "run", "dev" ]
