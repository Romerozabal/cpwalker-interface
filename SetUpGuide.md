# **CPWalker Robotic Platform's Interface Set-up**

In this repository it has been developed the current User Interface of the CPWalker Robotic Platform of the CSIC CAR-UPM, a rehabilitation robotic system for patients with Cerebral Palsy.


1º - **OS Installation**: Install in your SD Card the Operating System for your Raspberry Pi 4 Model B: Debian 10 Buster. We recommend you to follow the instruction in the official documentation web of [raspberry image OS installation](https://www.raspberrypi.org/documentation/installation/installing-images/). In case you want a customized installation the Debian 10 Buster image .zip can be download here: [Debian 10 Buster image](https://downloads.raspberrypi.org/raspios_armhf/images/raspios_armhf-2021-05-28/).

2º - **CPWalker Interface dependecies**: Once Debian 10 is installen in the raspberry, connect it to the internet and download the following dependencies:
 - Install **NodeJs**: 
 
    $ sudo apt update
    
    $ sudo apt install nodejs npm
    
    - Clone this repository in your desired folder and install the CPWalker interface requirements.
   
	- Install **express** module:

	  $ sudo npm install express (some errors may occur during installation) 
     
  - Install **MariaDB** database and configure the CPWalker database:
	
	$ sudo apt install mariadb-server
      
    $ sudo muysql_secure_installation (password "mysql")
    
  - Configure CPWalker database using the *cpwdb_scriptdb.sql* file in this repository.
    $ sudo mysql -u root
      
    $ > CREATE DATABASE cpwdb;
      
      $ > CREATE USER 'root'@'localhost' IDENTIFIED BY 'mysql';
      
      $ > GRANT ALL PRIVILEGES ON cpwdb.* TO 'root'@'localhost';
      
      $ > FLUSH PRIVILEGES;
      
      $ > exit;
      
      $ sudo mysql -u root cpwdb < ~/cpwalker_interface/cpwdb_scriptdb.sql
      
3º - **Wireless Access Point**: Once you have installed the previous packages, and dependencies configure the raspberry pi as WiFi access point following the raspberry pi official documentation [Setting up a Raspberry Pi as a routed wireless access point](https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md) modifying the following lines:
 - In */etc/dhcpcd.conf*:   
 
   static ip_address=192.168.43.1/24
   
 - In */etc/dnsmasq.conf*: 
 
   bdhcp-range=192.168.43.2,192.168.43.20,255.255.255.0,24h
   
   address=/gw.wlan/192.168.43.1
   
 - In */etc/hostapd/hostapd.conf*:
 
   country_code=ES
   
   wpa_passphrase=gneccarcsic
    
