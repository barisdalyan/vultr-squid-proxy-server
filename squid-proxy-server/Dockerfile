FROM ubuntu:22.04

ARG PROXY_USERNAME
ARG PROXY_PASSWORD

RUN apt update && apt upgrade -y
RUN apt install -y squid && \
apt install -y curl && \
apt install -y apache2-utils && \
apt install -y ufw
RUN ufw allow 3128
RUN systemctl status squid.service | cat
RUN htpasswd -b -c /etc/squid/passwords "$PROXY_USERNAME" "$PROXY_PASSWORD"

COPY . /root/squid-proxy-server/
COPY squid.conf /etc/squid/
WORKDIR /root/squid-proxy-server/

RUN systemctl restart squid.service | cat

CMD ["sh", "-c", "squid && sleep infinity"]