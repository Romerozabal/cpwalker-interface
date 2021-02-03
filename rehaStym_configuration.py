 #!/usr/bin/python

import serial
import glob
import socket

CPWALKER_IP = "127.0.0.1"
PORT_FES = 6000;

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((CPWALKER_IP, PORT_FES))


# Get list of serial devices connected:
serial_ports = glob.glob('/dev/tty[A-Za-z]*')
print(serial_ports)

while True: 
	#Chech available serial devices
	serial_ports = glob.glob('/dev/tty[A-Za-z]*')
	if (any('/dev/ttyUSB0' == serial_port for serial_port in serial_ports)):
		# configure the serial connections (the parameters differs on the device you are connecting to)
		ser = serial.Serial(
				port='/dev/ttyUSB0',
				baudrate=115200,
				parity=serial.PARITY_NONE,
				stopbits=serial.STOPBITS_ONE,
				bytesize=serial.EIGHTBITS
		)
		trama_fes = sock.recvfrom(1024) 
		trama_fes = bytearray(trama_fes[0])
		print(len(trama_fes))
		print("Trama: ")
		for data in trama_fes:
			print(data)
		ser.write(trama_fes)
	else:
		continue
	