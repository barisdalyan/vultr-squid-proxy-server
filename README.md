# Vultr Squid Proxy Server

## Introduction

[Squid](https://www.squid-cache.org/) is a proxy cache server software which provides proxy and cache services for HTTP, HTTPS, FTP, and other popular network protocols.

It acts as an intermediary between web servers and clients. When a client sends a request for content, Squid fetches the content from the web server and creates a local copy. Then, if a request is made again, it shows the cached copy instead of making another request to the web server. In this way, performance is improved and network bandwidth is optimised. It can also filter web traffic, helping to improve security.

Squid is free software released under the GNU General Public License.

## Prerequisites

### Create an SSH Key with OpenSSH

Generate your key with ssh-keygen.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press ENTER to save the key in the default location.
> **Not:** By default, the keys are stored in the ~/.ssh directory.

```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/example/.ssh/id_ed25519):
```

You may enter a passphrase for your key but you can press ENTER to bypass this prompt. I bypassed this step to get complete proxy building without any user-interaciton.

```
 Enter passphrase (empty for no passphrase):
 Enter same passphrase again:
```

Your key is generated and saved.

```
 Your identification has been saved in /Users/example/.ssh/id_ed25519.
 Your public key has been saved in /Users/example/.ssh/id_ed25519.pub.
 The key fingerprint is:
 SHA256:qx6prR4Zo+VU7Fl8yivXzzzzzzzzJ/9NRnPbrC20w7g example@example.com
 The key's randomart image is:
 +--[ED25519 256]--+
 |                 |
 |     o .         |
 |    o B o + .    |
 |     B + + o +   |
 |    = = S o o o  |
 |   = + = O + +   |
 |  . + B B = * .  |
 |     = O   + o   |
 |   .+o=.. E .    |
 +----[SHA256]-----+
```

### Add SSH Key to Vultr Instance

Before connecting to an existing server with your SSH key, you need to add the public key to the authorized_keys file. Replace the correct public key with the **-i** parameter.

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@ip_address
```

The **ssh-copy-id** will report some basic information and prompt for your server password. You can find it on Vultr Products > Instance > Overview.

```
  /usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/example_user/.ssh/id_ed25519.pub"
  /usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
  /usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
  root@ip_address's password:
    
    Number of key(s) added: 1

  Now try logging into the machine, with:   "ssh 'root@ip_address'"
  and check to make sure that only the key(s) you wanted were added.
```

> You can also add the public key to your Vultr account. I highly recommend this method to automate the deployment process seamlessly.

<img src="screenshots/vultr-ssh-keys.png" alt="Vultr ssh keys">

## How to use

- Clone the repository and fill in the relevant places in the `.env` file.

```
VULTR_API_KEY=
VULTR_SSH_KEY_ID=
```

- Set the proxy credentials in the `/squid-proxy-server/docker-compose.yml` file.

```
args:
- PROXY_USERNAME=
- PROXY_PASSWORD=
```

- Run the following commands:

```bash
docker build -t vultr-squid-proxy-server .
```

```bash
docker run -it -v /Users/example_user/.ssh:/root/.ssh -v ./deploy_docker_squid.log:/root/vultr-squid-proxy-server/deploy_docker_squid.log vultr-squid-proxy-server
```

```
Instance info:
{"instance":{"id":"id","os":"Ubuntu 22.04 x64","ram":1024,"disk":0,"main_ip":"0.0.0.0","vcpu_count":1,"region":"ams","plan":"vc2-1c-1gb","date_created":"2024-02-24T17:20:45+00:00","status":"pending","allowed_bandwidth":1,"netmask_v4":"","gateway_v4":"0.0.0.0","power_status":"running","server_status":"none","v6_network":"","v6_main_ip":"","v6_network_size":0,"label":"squid-proxy-server","internal_ip":"","kvm":"","hostname":"squid-proxy-server","tag":"","tags":[],"os_id":1743,"app_id":0,"image_id":"","firewall_group_id":"","features":[],"user_scheme":"root","default_password":"default_password"}}
Instance is not ready yet. Waiting 10 seconds...
Instance is not ready yet. Waiting 10 seconds...
Instance is not ready yet. Waiting 10 seconds...
.
.
.
Instance (78.141.212.183) is ready for SSH connection!
Message: docker-squid deployed to /root/ directory.
Script exited with code: 0
```

- To test the proxy and see if it works, run the following command:

```bash
curl -v -x http://your_squid_username:your_squid_password@your_server_ip:3128 https://www.google.com/
```

## Screenshot

<img src="screenshots/squid-proxy-server.png" alt="Vultr squid proxy server">

## Support

<p  align="left">

<img src="https://www.vultr.com/media/logo_onwhite.svg" alt="Vultr logo" width="150">

</p>

If you are considering creating a Vultr Cloud account, you can support me through this [link](https://www.vultr.com/?ref=9228967).

## License

This project is released under the GPL-3.0 License.
