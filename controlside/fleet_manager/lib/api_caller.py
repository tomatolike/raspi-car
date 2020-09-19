import lib.fmconfig as fmconfig
import requests

def call(addr, api, port=0, dev=False, creds=False, _header=None, get=True, _data=None):
    prefix = "https://"
    if dev:
        prefix = "http://"
    portfix = ""
    if port != 0:
        portfix = ":"+str(port)
    if creds:
        _cert = (fmconfig.get_creds()['crt'],fmconfig.get_creds()['key'])
        # print(prefix + addr + portfix + "/" + api,_cert)
        try:
            # print(prefix + addr + portfix + "/" + api)
            if get:
                res = requests.get(prefix + addr + portfix + "/" + api, headers=_header, cert=_cert, timeout=10)
            else:
                res = requests.post(prefix + addr + portfix + "/" + api, headers=_header, cert=_cert, timeout=10, data=_data)
            # print(res)
        except:
            return {'status':'connection failed'}
    else:
        try:
            if get:
                res = requests.get(prefix + addr + portfix + "/" + api, headers=_header, timeout=10)
            else:
                res = requests.post(prefix + addr + portfix + "/" + api, headers=_header, timeout=10, data=_data)
        except:
            return {'status':'connection failed'}
    return {'status':'success','data':res}