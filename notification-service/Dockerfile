FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/notification-service

COPY notification-service/package.json notification-service/tsconfig.json ./
COPY notification-service/src ./src
RUN npm install

EXPOSE 3006

CMD [ "npm", "run", "dev" ]
