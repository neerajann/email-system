FROM node:22-alpine

WORKDIR /app

COPY package*.json .
COPY core ./core
COPY smtp-server ./smtp-server

RUN npm install --omit=dev

WORKDIR /app/smtp-server

EXPOSE 25

CMD [ "npm","start" ]