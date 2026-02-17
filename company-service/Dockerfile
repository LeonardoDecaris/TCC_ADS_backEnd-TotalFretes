FROM node:22-slim AS build

WORKDIR /app

COPY src /app/src
COPY package.json /app
COPY tsconfig.json /app
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]