#!/bin/bash
{
 apt update && apt upgrade -y
 scp -o "StrictHostKeyChecking=no" -r squid-proxy-server/ root@$1:/root/
 ssh -o "StrictHostKeyChecking=no" root@$1 'cd squid-proxy-server/ && docker compose up -d'
} > deploy_docker_squid.log 2>&1