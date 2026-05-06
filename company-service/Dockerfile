FROM node:22-slim AS build

WORKDIR /app/packages/rpc-contracts
COPY packages/rpc-contracts/package.json packages/rpc-contracts/tsconfig.json ./
COPY packages/rpc-contracts/src ./src
RUN npm install && npm run build

WORKDIR /app/company-service
COPY company-service/package.json company-service/tsconfig.json ./
COPY company-service/src ./src
RUN npm install

EXPOSE 3002

CMD [ "npm", "run", "dev" ]
