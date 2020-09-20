from lib.network import NETWORK

network = NETWORK()

network.start_tcp(12345)

def send(packet):
    global network
    if not network.connected:
        network.accept_tcp()
    if network.send_tcp(packet):
        return True
    else:
        return False