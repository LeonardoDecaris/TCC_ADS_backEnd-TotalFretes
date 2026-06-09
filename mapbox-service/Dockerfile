FROM node:22-slim

WORKDIR /app/packages/logging
COPY packages/logging/package.json packages/logging/tsconfig.json ./
COPY packages/logging/src ./src
RUN npm install && npm run build

WORKDIR /app/mapbox-service

COPY mapbox-service/package.json mapbox-service/tsconfig.json ./

RUN npm install

COPY mapbox-service/src ./src

EXPOSE 3004

CMD [ "npm", "run", "dev" ]
