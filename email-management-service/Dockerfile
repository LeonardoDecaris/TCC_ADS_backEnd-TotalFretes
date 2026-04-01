FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

EXPOSE 3003

CMD [ "npm", "run", "dev" ]