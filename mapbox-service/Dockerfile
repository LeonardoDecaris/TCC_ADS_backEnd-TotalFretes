FROM node:22-slim

WORKDIR /app/packages/observability
COPY packages/observability/package.json packages/observability/tsconfig.json ./
COPY packages/observability/src ./src
RUN npm install && npm run build

WORKDIR /app/mapbox-service

COPY mapbox-service/package.json mapbox-service/tsconfig.json ./

RUN npm install

COPY mapbox-service/src ./src

EXPOSE 3004

CMD [ "npm", "run", "dev" ]