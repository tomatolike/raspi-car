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

def status():
    global network
    msg = {
        "connected":'unconnected',
        "addr":("",-1)
    }
    if network.connected:
        msg['connected'] = 'connected'
        msg['addr'] = network.addr

    return msg