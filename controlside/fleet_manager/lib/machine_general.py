import lib.db as db
import json
from datetime import datetime
import lib.datadef as df
import time

def single_machine(provider=None, tp=None):
    m = {
        'ip': df.get_data_value(provider,'ip') or df.get_data_value(tp,'ip'),
        'provider_info':{
            'provider': df.get_data_value(provider,'provider'),
            'contract_id': df.get_data_value(provider,'contract.id'),
            'contract_expiration': df.get_data_value(provider,'contract.end'),
            'datacenter': df.get_data_value(provider,'datacenter'),
            'additional_info':df.get_data_value(provider,'info'),
            'os':df.get_data_value(provider,'os'),
            'last_state_update': time.time()
        },
        'tp_info':{
            'last_env': df.get_data_value(tp,'hq'),
            'last_state_update': time.time(),
            'machine_type': df.get_data_value(tp,'state.state.machine_type'),
            'maintenance': df.get_data_value(tp,'state.state.maintenance'),
            'label': df.get_data_value(tp,'settings.comment'),
            'tags':df.get_data_value(tp,'settings.tags'),
            'os':df.get_data_value(tp,'state.state.facts.os'),
            'cores':df.get_data_value(tp,'state.state.facts.cores') or 0,
            'connected':df.get_data_value(tp, 'state.connected') or False,
        },
        'os':None,
        'issues':{
            'count':0,
            'ids':[]
        },
        'diagnose':{
            'status':None,
            'error':None,
            'detail':None,
            'timestamp':None
        },
        'provision':{
            'status':'',
            'brief':'',
            'result':[],
            'timestamp':None
        },
        'migration':{
            'status':'',
            'aimed_env':'',
            'timestamp':None
        }
    }
    return m

def get_machines(key):
    res = db.find("machines",key)
    machines = []
    if res['status'] == 'success':
        for m in res['data']:
            machines.append(m)
    return machines

def update_machines(key, data, upsert=False):
    return db.update("machines", key, data, upsert)

def clear_machines():
    db.drop("machines")

def add_issue_related(ip,_id,topic):
    db.increase("machines",{'ip':ip},{'issues.count':1})
    db.append("machines", {'ip':ip}, {'issues.ids':{'issue_id':_id,'issue_topic':topic}})

def clear_issue_relation(ip,_id):
    db.increase("machines",{'ip':ip},{'issues.count':-1})
    db.pull("machines",{'ip':ip},{"issues.ids":{'issue_id':_id}})

def apeend_item(ip,key,item):
    db.append("machines", {'ip':ip}, {key:item})

def update_os(ip,os):
    return db.update("machines", {'ip':ip}, {'os':os})

def get_machine_os(ip):
    res = db.find("machines",{'ip':ip})
    if res['status'] == 'success':
        machine = res['data'][0]
        os = df.get_data_value(machine,'os')
        return os
    else:
        return None

def sum_cores(_filter):
    res = db.sum("machines",_filter,"tp_info.cores")
    return res

def change_hq_tags(key, value):
    db.update("machines", key, {'tp_info.tags':value})

def change_hq_label(key, value):
    db.update("machines", key, {'tp_info.label':value})

def change_hq_maintenance(key, value):
    if value:
        db.update("machines", key, {'tp_info.maintenance':'maintenance'})
    else:
        db.update("machines", key, {'tp_info.maintenance':None})

def delete_machine(key):
    return db.delete("machines", key)