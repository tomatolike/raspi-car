import socket
import json

class NETWORK:

    def start(self, _port):
        self.port = _port
        self.udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        bind_addr = ('', self.port)
        self.udp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.udp_socket.bind(bind_addr)

    def listen(self):
        recv_data = self.udp_socket.recvfrom(1024)
        #print(recv_data)
        data_str = recv_data[0].decode("utf-8")
        data = json.loads(data_str)
        return data

    def close(self):
        self.udp_socket.close()

    def connect_tcp(self, _host, _port):
        self.port = _port
        self.host = _host
        self.tcp_socket = socket.socket()
        # self.tcp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        print(_host,_port)
        try:
            self.tcp_socket.connect((self.host, self.port))
            return True
        except Exception as e:
            print(e)
            return False
        return True

    def listen_tcp(self):
        recv_data = self.tcp_socket.recv(1024)
        data_str = recv_data.decode("utf-8")
        data = json.loads(recv_data)
        return data

    def close_tcp(self):
        self.tcp_socket.close()
