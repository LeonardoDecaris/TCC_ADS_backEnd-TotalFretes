FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY index.ts /app
COPY package.json /app
COPY tsconfig.json /app
RUN npm install

EXPOSE 3005

CMD ["npm", "run", "start"]
