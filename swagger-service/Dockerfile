FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/swagger-service

COPY swagger-service/package.json swagger-service/tsconfig.json ./
COPY swagger-service/index.ts ./
COPY swagger-service/src ./src

RUN npm install

EXPOSE 3005

CMD ["npm", "run", "start"]
