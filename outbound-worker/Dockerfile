FROM node:22-alpine

WORKDIR /app

COPY package*.json .
COPY core ./core
COPY outbound-worker ./outbound-worker

RUN npm install --omit=dev

WORKDIR /app/outbound-worker

CMD [ "npm","start" ]