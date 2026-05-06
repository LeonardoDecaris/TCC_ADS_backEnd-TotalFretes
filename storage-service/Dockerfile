FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/storage-service

COPY storage-service/package.json storage-service/tsconfig.json ./
COPY storage-service/src ./src
RUN npm install

EXPOSE 3007

CMD [ "npm", "run", "dev" ]
