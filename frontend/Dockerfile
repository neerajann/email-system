FROM node:22-alpine AS build

WORKDIR /app

COPY /frontend/package*.json .

RUN npm install

COPY /frontend .

ARG VITE_DOMAIN_NAME
ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY /frontend/nginx.conf /etc/nginx/nginx.conf

RUN rm /etc/nginx/conf.d/default.conf

COPY /frontend/app.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

CMD [ "nginx" ,"-g" ,"daemon off;"]