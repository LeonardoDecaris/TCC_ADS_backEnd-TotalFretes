FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/freight-service

COPY freight-service/package.json freight-service/tsconfig.json ./
COPY freight-service/src ./src
RUN npm install

EXPOSE 3008

CMD [ "npm", "run", "dev" ]
