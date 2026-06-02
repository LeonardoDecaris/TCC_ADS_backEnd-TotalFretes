FROM node:22-slim AS build

WORKDIR /app/packages/rpc-contracts
COPY packages/rpc-contracts/package.json packages/rpc-contracts/tsconfig.json ./
COPY packages/rpc-contracts/src ./src
RUN npm install && npm run build

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/authentication-service
COPY authentication-service/package.json authentication-service/tsconfig.json ./
COPY authentication-service/src ./src
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
