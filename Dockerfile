FROM node:16-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV CORS_ORIGIN=https://sebagutierrezf.github.io

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"] 