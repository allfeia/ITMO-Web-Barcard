FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend .

EXPOSE 4000

CMD ["sh", "-c", "npm run db:sync && npm run root && npm start"]
