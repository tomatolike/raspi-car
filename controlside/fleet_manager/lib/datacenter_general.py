import lib.db as db
import json
from datetime import datetime
import lib.datadef as df
import lib.fmconfig as fmconfig

def new_datacenter(name,provider,id,alt_name):
    m = {
        'name':name,
        'provider':provider,
        'id':id,
        'alt_names':alt_name or [],
        'all':0,
        'connected':0,
        'pre_provision':0,
        'issue_machine':0,
        'cores':0,
        'issues':{
            'count':0,
            'ids':[]
        },
    }
    return m

def change_name(data,provider):
    if provider == "Blizzard":
        return "blizzard-%s"%(data["basename"])
    elif provider == "GameServers":
        return "gs-"+data["basename"]
    elif provider == "Multiplay":
        return "mp-"+data["name"].lower().replace(",","").replace(".","").replace(" ","-")
    else:
        return "unknown"

def trans_dc_name(oriname, provider):
    newname = oriname.lower()
    newname = newname.replace(",","")
    newname = newname.replace("\"","")
    newname = newname.replace(".","")
    newname = newname.replace(" ","-")
    if provider == "GameServers":
        return "gs-"+newname
    elif provider == "Multiplay":
        return "mp-"+newname
    elif provider == "Blizzard":
        return "blizzard-"+newname
    else:
        return "unknown"

def match(name,provider):
    trans_name = trans_dc_name(name,provider)
    datacenters = get_datacenter({'provider':provider})
    
    for dc in datacenters:
        if dc['name'] == trans_name:
            return dc['name']
        if name in dc.get('alt_names'):
            return dc['name']
    
    return "unknown(%s)"%(name)

def get_datacenter(key):
    res = db.find("datacenters",key)
    datacenters = []
    if res['status'] == 'success':
        for m in res['data']:
            datacenters.append(m)
    return datacenters

def update_datacenters(key, data, upsert=False):
    return db.update("datacenters", key, data, upsert)

def load_from_file():
    datacenters = fmconfig.load_datacenters()
    ndcs = []
    for provider in datacenters.keys():
        for dc in datacenters[provider]['centers']:
            name = change_name(dc, provider)
            ndc = new_datacenter(name,provider,dc['id'],dc.get('alt_names'))
            ndcs.append(ndc)
            if db.count("datacenters",{'id':ndc['id']}) == 0:
                update_datacenters({'id':ndc['id']},ndc,True)
    return ndcs

def refresh():
    datacenters = load_from_file()
    for dc in datacenters:
        # print(dc)
        _all = db.count("machines",{'provider_info.datacenter':dc['name']})
        not_connected = db.count("machines",{'provider_info.datacenter':dc['name'],'tp_info.last_env':None})
        connected = _all - not_connected
        pre_provision = db.count("machines",{'provider_info.datacenter':dc['name'],'provision.status':None})
        issue_machine = db.count("machines",{'provider_info.datacenter':dc['name'],'issues.count':{'$gte':0}})
        # print(_all, connected, pre_provision, issue_machine)
        cores = db.sum("machines",{'provider_info.datacenter':dc['name']},"tp_info.cores")
        update_datacenters({'id':dc['id']}, {'all':_all, 'connected':connected, 'pre_provision':pre_provision, 'cores':cores, 'issue_machine':issue_machine})

def clear_datacenters():
    db.drop("datacenters")

def add_issue_related(name,_id,topic):
    db.increase("datacenters",{'name':name},{'issues.count':1})
    db.append("datacenters", {'name':name}, {'issues.ids':{'issue_id':_id,'issue_topic':topic}})

def clear_issue_relation(name,_id):
    db.increase("datacenters",{'name':name},{'issues.count':-1})
    db.pull("datacenters",{'name':name},{"issues.ids":{'issue_id':_id}})