import json
import os

config = None
configpath = os.path.abspath( os.path.join( os.path.dirname( __file__ ), "..", "config" ) )
credspath = os.path.abspath( os.path.join( os.path.dirname( __file__ ), "..", "..", "creds" ) )

def get_config():
    global config,configpath
    # print(configpath)
    f = open(configpath+"/fm.conf","r")
    config = json.load(f)
    f.close()

def get_db_url():
    global config
    if config == None:
        get_config()
    return config["db_url"]

def get_hq_list(full=True):
    global config
    if config == None:
        get_config()
    res = []
    if full:
        for hq in config["hq"]:
            res.append(hq+"-hq.tp.demonware.net")
    else:
        for hq in config["hq"]:
            res.append(hq)
    return res

def get_creds():
    global config,credspath
    if config == None:
        get_config()
    res = {
        "key":os.path.join(credspath, config["creds"]["key"]),
        "crt":os.path.join(credspath, config["creds"]["crt"])
    }
    # print(res)
    return res

def get_titles():
    global config
    if config == None:
        get_config()
    return config["titles"]

def get_gs_creds():
    global config,credspath
    if config == None:
        get_config()

    res = {
        'clientid':os.path.join(credspath,config['creds']['gs']['clientid']),
        'creds':os.path.join(credspath,config['creds']['gs']['creds']),
        'pickle':os.path.join(credspath,config['creds']['gs']['pickle'])
    }

    return res

def get_ssh_keys():
    global config,credspath
    if config == None:
        get_config()
    return os.path.join(credspath,config['creds']['ssh'])

def get_provider_gs_config(provider):
    global config
    if config == None:
        get_config()
    
    return config['provider'][provider]

def get_provider_list():
    global config
    if config == None:
        get_config()
    return config['provider'].keys()

def load_datacenters():
    f = open(configpath+"/datacenter.json","r")
    datacenters = json.load(f)
    f.close()
    return datacenters