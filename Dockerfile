FROM node:20.10-slim

WORKDIR /root/vultr-squid-proxy-server/
COPY . .

RUN apt update && apt upgrade -y
RUN apt install -y openssh-client
RUN npm install

CMD [ "node", "proxy.js" ]