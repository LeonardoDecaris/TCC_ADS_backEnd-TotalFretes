FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/logging
COPY packages/logging/package.json packages/logging/tsconfig.json ./
COPY packages/logging/src ./src
RUN npm install && npm run build

WORKDIR /app/packages/demo-seed-data
COPY packages/demo-seed-data/package.json packages/demo-seed-data/tsconfig.json ./
COPY packages/demo-seed-data/src ./src
RUN npm install && npm run build

WORKDIR /app/packages/tracing
COPY packages/tracing/package.json packages/tracing/tsconfig.json ./
COPY packages/tracing/src ./src
RUN npm install && npm run build

WORKDIR /app/storage-service

COPY storage-service/package.json storage-service/tsconfig.json ./
COPY storage-service/src ./src
RUN npm install

EXPOSE 3007

CMD [ "npm", "run", "dev" ]
