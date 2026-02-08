FROM node:22-alpine

WORKDIR /app

COPY package*.json .
COPY core ./core
COPY backend ./backend

RUN npm install --omit=dev

WORKDIR /app/backend

EXPOSE 3000

CMD [ "npm","start" ]