FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

ARG VITE_DOMAIN_NAME
ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/

RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx" ,"-g" ,"daemon off;"]