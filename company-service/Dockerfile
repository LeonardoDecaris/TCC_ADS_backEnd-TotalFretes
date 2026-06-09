FROM node:22-slim AS build

WORKDIR /app/packages/logging
COPY packages/logging/package.json packages/logging/tsconfig.json ./
COPY packages/logging/src ./src
RUN npm install && npm run build

WORKDIR /app/company-service
COPY company-service/package.json company-service/tsconfig.json ./
COPY company-service/src ./src
RUN npm install

EXPOSE 3002

CMD [ "npm", "run", "dev" ]
