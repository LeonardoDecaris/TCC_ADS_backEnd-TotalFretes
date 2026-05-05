FROM node:22-slim AS base

WORKDIR /app/i18n-translation-service

COPY i18n-translation-service/package.json ./
RUN npm install

COPY i18n-translation-service/tsconfig.json ./
COPY i18n-translation-service/src ./src
COPY i18n-translation-service/i18n ./i18n

RUN npm run build

EXPOSE 3006

CMD ["npm", "start"]
