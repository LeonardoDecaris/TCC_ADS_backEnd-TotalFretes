FROM node:22-slim AS build

WORKDIR /app/user-service
COPY user-service/package.json user-service/tsconfig.json ./
COPY user-service/src ./src
RUN npm install

EXPOSE 3001

CMD [ "npm", "run", "dev" ]
