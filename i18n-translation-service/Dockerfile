FROM node:22-slim AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY i18n ./i18n

RUN npm run build

EXPOSE 8088

CMD ["npm", "start"]