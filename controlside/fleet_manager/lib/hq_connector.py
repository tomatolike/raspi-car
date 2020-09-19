import lib.api_caller as api_caller
import json
import threading
import lib.fmconfig as fmconfig
import time
import lib.db as db
import lib.machine_general as mg
from celery import group
import time

def get_hq_machines(hq):
    res = api_caller.call(hq,"api/machines_list_all_brief/",creds=True)
    if res['status'] == 'success':
        if res['data'].status_code == 200:
            return {'status':'success','data':json.loads(res['data'].text)['data']}
        else:
            # print(res['data'].status_code, res['data'].reason)
            return {'status':'failed','error':res['data'].reason}
    else:
        # print(res['status'])
        return {'status':'failed','error':'connection failed'}

def initial_status(hq):
    status = {
        'source':hq,
        'type':'HQ',
        'status':'No',
        'error':'',
        'number':'',
        'timestamp':0,
    }
    return status

def get_status(hq):
    res = db.find('status',{'source':hq, 'type':'HQ'})
    if res['status'] == 'success':
        return res['data'][0]
    else:
        status = initial_status(hq)
        db.insert('status',status)
        return status

def change_update_status(key, data):
    res = db.update('status',key,data)
    if res['status'].modified_count == 0:
        return False
    return True

def check_update_status(hq):
    res = get_status(hq)
    ok = False
    s = None
    if res['status'] != 'Updating':
        ok = True
        s = res['status']
    return ok,s

def start_update(hq):
    ok,status = check_update_status(hq)

    if not ok:
        return False

    if not change_update_status({'source':hq, 'type':'HQ', 'status':status},{'status':'Updating','timestamp':time.time()}):
        return False

    return True

def fresh_machines(startime, hq):
    # mg.update_machines({'tp_info.last_env':hq, 'tp_info.last_state_update':{'$lt':startime}},{'tp_info.connected':False})
    res = mg.get_machines({'tp_info.last_env':hq, 'tp_info.last_state_update':{'$lt':startime}})
    for machine in res:
        # print("Unconnect",machine['ip'])
        mg.update_machines({'ip':machine['ip']},{'tp_info.connected':False})

    res = mg.get_machines({'tp_info.connected':False, 'provider_info.provider':None})
    for machine in res:
        print("Removed",machine['ip'])
        mg.delete_machine({'ip':machine['ip']})
    

def update_hq_machines(hq):
    print(hq,"Updating")
    hqname = hq.split('-')[0]
    result = get_hq_machines(hq)
    if result['status'] != 'success':
        msg = {'status':'Failed','error':result['error'],'number':0}
        change_update_status({'source':hq,'type':'HQ'},msg)
        return False
    startime = time.time()
    machine_data = result['data']
    # print(len(machine_data))
    for m in machine_data:
        if m['state']['connected'] != True or m['state']['state']['elastic'] != False:
            continue
        ip = m['ip']
        m['hq'] = hqname
        data = mg.single_machine(None, m)['tp_info']
        updatemsg = {}
        if data['os'] != None:
            updatemsg = {
                'tp_info':data,
                'os':data['os']
            }
        else:
            updatemsg = {
                'tp_info':data
            }
        mg.update_machines({'ip':ip}, updatemsg, True)
    msg = {'status':'Updated','error':'','number':len(machine_data)}
    # msg = {'hqs.'+hqname:{'type':'HQ','status':'success','error':'','number':len(machine_data)}}
    change_update_status({'source':hq,'type':'HQ'},msg)
    fresh_machines(startime, hqname)
    print(hq,"Updated")
    return True

def update_all_machines(subfunc):
    hqlist = fmconfig.get_hq_list()
    for hq in hqlist:
        if start_update(hq):
            update_hq_machines(hq)
    return True

# def initial_status():
#     status = {
#         'id':'hq_update_status',
#         'status':'Updated',
#         'hqs':{}
#     }
#     return status

# def get_update_status():
#     res = db.find('status',{'id':'hq_update_status'})
#     if res['status'] == 'success':
#         return res['data'][0]
#     else:
#         status = initial_status()
#         db.insert('status',status)
#         return status

def migrate(ip, fromenv, toenv):
    msg = {
            'status':'Migrating',
            'aimed_env':toenv,
            'timestamp':time.time()
        }
    mg.update_machines({'ip':ip}, {'migration':msg})
    fromhq = fromenv+"-hq.tp.demonware.net"
    tohq = toenv+"-hq.tp.demonware.net"
    # print("API:",ip,fromenv,toenv)
    res = api_caller.call(fromhq,"api/retarget_agent/"+ip+"/"+tohq,creds=True)
    # print(res)
    if res['status'] != 'success':
        return False
    # print("result",res['data'].text)
    try:
        ok = json.loads(res['data'].text)['data']['response_code']
        if ok != "success":
            return False
        else:
            return True
    except:
        print("wrong with return data",json.loads(res['data'].text))
        return False

def get_one_machine_from_hq(ip, hq):
    # print("get "+ip+" from "+hq)
    res = api_caller.call(hq+"-hq.tp.demonware.net","api/machine_state/"+ip,creds=True)
    if res['status'] == 'success':
        if res['data'].status_code == 200:
            data = json.loads(res['data'].text)
            print(data)
            if data != None:
                return {'status':'success','data':json.loads(res['data'].text)['data']}
            else:
                return {'status':'failed','error':'no this machine'}
        else:
            # print(res['data'].status_code, res['data'].reason)
            return {'status':'failed','error':res['data'].reason}
    else:
        # print(res['status'])
        return {'status':'failed','error':'connection failed'}

def change_hq_tags(ip, value):
    m = mg.get_machines({'ip':ip})
    if len(m) <= 0:
        return False
    else:
        if m[0].get('tp_info') != None and m[0]['tp_info'].get('last_env') != None and m[0]['tp_info'].get('connected') == True:
            hq = m[0]['tp_info']['last_env']
            # print(json.dumps(value))
            headers = {'Content-type':'application/json'}
            res = api_caller.call(hq+'-hq.tp.demonware.net','api/machine_set_tags/'+ip,creds=True,get=False,_header=headers,_data=json.dumps({"tags":value}))
            if res['status'] == 'success':
                # print(res['data'].text)
                if res['data'].status_code == 200:
                    data = json.loads(res['data'].text)
                    if data['success'] == True:
                        mg.change_hq_tags({'ip':ip},value)
                        return True
        return False

def change_hq_label(ip, value):
    m = mg.get_machines({'ip':ip})
    if len(m) <= 0:
        return False
    else:
        if m[0].get('tp_info') != None and m[0]['tp_info'].get('last_env') != None and m[0]['tp_info'].get('connected') == True:
            hq = m[0]['tp_info']['last_env']
            # print(json.dumps(value))
            headers = {'Content-type':'application/json'}
            res = api_caller.call(hq+'-hq.tp.demonware.net','api/machine_set_comment/'+ip,creds=True,get=False,_header=headers,_data=json.dumps({"comment":value}))
            if res['status'] == 'success':
                # print(res['data'].text)
                if res['data'].status_code == 200:
                    data = json.loads(res['data'].text)
                    if data['success'] == True:
                        mg.change_hq_label({'ip':ip},value)
                        return True
        return False

def change_hq_maintenance(ip, value):
    m = mg.get_machines({'ip':ip})
    if len(m) <= 0:
        return False
    else:
        if m[0].get('tp_info') != None and m[0]['tp_info'].get('last_env') != None and m[0]['tp_info'].get('connected') == True:
            hq = m[0]['tp_info']['last_env']
            # print(json.dumps(value))
            headers = {'Content-type':'application/json'}
            bol = 'true'
            if not value:
                bol = 'false'
            res = api_caller.call(hq+'-hq.tp.demonware.net','api/machine_drain/'+ip+'/'+bol,creds=True,get=False,_header=headers)
            if res['status'] == 'success':
                # print(res['data'].text)
                if res['data'].status_code == 200:
                    data = json.loads(res['data'].text)
                    if data['success'] == True:
                        mg.change_hq_maintenance({'ip':ip},value)
                        return True
        return False