FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/swagger-service

COPY swagger-service/package.json swagger-service/tsconfig.json ./
COPY swagger-service/*.ts ./

RUN npm install

EXPOSE 3005

CMD ["npm", "run", "start"]
