# cpwalker-interface
*Interface of the CPWalker Robotic Platform*

In this repository it has been developed the current User Interface of the CPWalker Robotic Platform of the CSIC CAR-UPM, a rehabilitation robotic system for patients with Cerebral Palsy.

*Raspberry Server SET-UP*
- Install Ubuntu Server 20.04:
https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview
-Install Nodejs:
https://www.instructables.com/Install-Nodejs-and-Npm-on-Raspberry-Pi/
- Install mysql data base in Ubuntu 20.04:
https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04
- Create the user with:
mysql > CREATE USER 'sammy'@'localhost' IDENTIFIED BY 'password';
- Create the database with:
mysql > CREATE DATABASE cpwdb;

