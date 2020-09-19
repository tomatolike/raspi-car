import socket
import json

class NETWORK:

	def start(self, _ip, _port):
		self.port = _port
		self.ip = _ip
		self.udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

	def send(self,data):
		data_str = json.dumps(data)
		send_data = bytes(data_str,'utf-8')
		self.udp_socket.sendto(send_data, (self.ip, self.port))

	def close(self):
		self.udp_socket.close()

	def start_tcp(self,_port):
		self.port = _port
		self.tcp_socket = socket.socket()
		self.tcp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
		try:
			print(socket.gethostname(),self.port)
			self.tcp_socket.bind(('192.168.1.12',self.port))
			self.tcp_socket.listen(5)
			return True
		except Exception as e:
			print(e)
			return False
		return True

	def accept_tcp(self):
		print("Waiting for connection")
		_c,_addr = self.tcp_socket.accept()
		print(_addr)
		self.c = _c
		self.addr = _addr

	def send_tcp(self,data):
		data_str = json.dumps(data)
		send_data = bytes(data_str,'utf-8')
		self.c.send(send_data)

	def close_tcp(self):
		self.c.close()
		self.tcp_socket.close()