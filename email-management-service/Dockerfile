FROM node:22-slim

WORKDIR /app/packages/rpc-contracts
COPY packages/rpc-contracts/package.json packages/rpc-contracts/tsconfig.json ./
COPY packages/rpc-contracts/src ./src
RUN npm install && npm run build

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/email-management-service
COPY email-management-service/package*.json ./
COPY email-management-service/tsconfig.json ./
RUN npm install

COPY email-management-service/src ./src

EXPOSE 3003

CMD [ "npm", "run", "dev" ]
