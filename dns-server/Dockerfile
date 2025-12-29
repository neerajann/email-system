FROM node   
RUN mkdir dns-server
COPY . /dns-server
WORKDIR /dns-server
EXPOSE 53
CMD ["node", "server.js" ]