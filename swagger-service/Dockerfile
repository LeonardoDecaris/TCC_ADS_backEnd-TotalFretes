FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/logging
COPY packages/logging/package.json packages/logging/tsconfig.json ./
COPY packages/logging/src ./src
RUN npm install && npm run build

WORKDIR /app/swagger-service

COPY swagger-service/package.json swagger-service/tsconfig.json ./
COPY swagger-service/index.ts ./
COPY swagger-service/src ./src
COPY swagger-service/config ./config
COPY swagger-service/utils ./utils
COPY swagger-service/*.ts ./

RUN npm install

EXPOSE 3005

CMD ["npm", "run", "start"]
