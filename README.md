# cpwalker-interface
*Interface of the CPWalker Robotic Platform*

In this repository it has been developed the current User Interface of the CPWalker Robotic Platform of the CSIC CAR-UPM, a rehabilitation robotic system for patients with Cerebral Palsy.

*Raspberry Server SET-UP*

- Install *Ubuntu Server 20.04*:

https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview


-Install *Nodejs*:

https://www.instructables.com/Install-Nodejs-and-Npm-on-Raspberry-Pi/


- Install *mysql* data base in Ubuntu 20.04:

https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04

- Create the *user* with:

mysql > CREATE USER 'sammy'@'localhost' IDENTIFIED BY 'password';

- Create the *database* with:

mysql > CREATE DATABASE cpwdb;


*Network Setup"

In order to connect to the CPWalker Platform you need to modify the configuration network files of the "/etc/netplan/*.yaml". In this folder "/etc/netplan/" after the first boot of the system you will find the file "50-cloud-ini.yaml" generated in the first boot, you may modify it to connect to the desired network as follows:

==================================================================================
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        eth0:
            dhcp4: true
            optional: true
    version: 2
    wifis:
        wlan0:
            optional: true
            access-points:
                "CP_WalkerAP":
                    password: "password"
==================================================================================



