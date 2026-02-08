FROM node:22-alpine

WORKDIR /app

COPY package*.json .
COPY core ./core
COPY inbound-worker ./inbound-worker

RUN npm install --omit=dev

WORKDIR /app/inbound-worker

CMD [ "npm","start" ]