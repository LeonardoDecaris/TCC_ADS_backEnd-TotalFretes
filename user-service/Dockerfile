FROM node:22-slim AS build

WORKDIR /app

COPY package.json /app
COPY tsconfig.json /app

RUN npm install

COPY src /app/src

EXPOSE 3001

CMD [ "npm", "run", "dev" ]