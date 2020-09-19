import lib.api_caller as api_caller
import lib.fmconfig as fmconfig
import lib.google_sheet as google_sheet
import json
import lib.db as db
import lib.machine_general as mg
import lib.datacenter_general as dg
import time

def new_machine():
    return {
        'ip':None,
        'datacenter':None,
        'provider':None,
        'contract':{
            'id':None,
            'start':None,
            'end':None
        },
        'info':None
    }



def make_gs_contract(contract=None):
    if contract == None:
        return {
            'id':None,
            'start':None,
            'end':None
        }

def make_blizzard_contract(contract=None):
    return make_gs_contract(contract)

def get_provider_machines(provider):
    result = {
        'data':[],
        'suc':True,
        'error':""
    }
    if provider == "GameServers":
        # get machines for all titles
        titles = fmconfig.get_titles()
        machines = []
        for title in titles:
            response = api_caller.call("webapi.gameservers.com","atvi/tp.php?type="+title,creds=False)
            if response['status'] != 'success':
                print("When",title,response['status'])
                result['data'] = machines
                result['suc'] = False
                result['error'] = response['status']
                return result
            else:
                response = response['data']
            if response.status_code != 200:
                print("When",title,response.reason)
                result['data'] = machines
                result['suc'] = False
                result['error'] = response.reason
                return result
            m_list = response.text.split("\n")[:-1]
            for m in m_list:
                rr = m.split(',')
                newm = new_machine()
                newm['ip'] = rr[0]
                newm['datacenter'] = dg.match(rr[1],provider)
                newm['provider'] = provider
                newm['contract'] = make_gs_contract()
                newm['contract']['id'] = title
                machines.append(newm)
        result['data'] = machines
        return result

    elif provider == "Multiplay":
        gs = fmconfig.get_provider_gs_config(provider)
        # print(google_sheet.readdata(gs['sheetid'],gs['range'])[1:-1])
        res = google_sheet.readdata(gs['sheetid'],gs['range'])
        data = res['data']
        suc = res['suc']
        error = res['error']
        if suc!=True:
            result['data'] = data
            result['suc'] = suc
            result['error'] = error
            return result
        machines = []
        for m in data:
            if len(m) < 3 or m[2] == '':
                continue
            if len(m) < 8 or m[7] == "cancel":
                continue
            newm = new_machine()
            newm['ip'] = m[2]
            newm['datacenter'] = dg.match(m[1],provider)
            newm['provider'] = provider
            newm['info'] = {
                'machine-id':m[0]
            }

            if len(m) > 9:
                newm['os'] = m[9]
            if len(m) > 10:
                newm['contract']['id'] = m[10]
            if len(m) > 13:
                newm['contract']['start'] = m[12]
                newm['contract']['end'] = m[13]
            machines.append(newm)
        result['data'] = machines
        return result

    elif provider == "Blizzard":
        googlesheet = fmconfig.get_provider_gs_config(provider)
        res = google_sheet.readdata(googlesheet['sheetid'],googlesheet['range'])
        data = res['data']
        suc = res['suc']
        error = res['error']
        if suc!=True:
            result['data'] = data
            result['suc'] = suc
            result['error'] = error
            return result
        machines = []
        for m in data:
            if len(m) < 3 or m[2] == '':
                continue
            if len(m) < 8 or m[7] == "cancel":
                continue
            newm = new_machine()
            newm['ip'] = m[2]
            newm['datacenter'] = dg.match(m[1],provider)
            newm['provider'] = provider
            newm['info'] = {
                'hostname':m[0]
            }
            newm['contract'] = make_blizzard_contract()
            if len(m) > 9:
                newm['os'] = m[9]
            machines.append(newm)
        result['data'] = machines
        return result
    else:
        result['suc'] = False
        result['error'] = "No such provider"
        return result

def initial_status(provider):
    status = {
        'source':provider,
        'type':'Provider',
        'status':'No',
        'error':'',
        'number':'',
        'timestamp':0,
    }
    return status

def get_update_status():
    res = db.find('status',{'id':'provider_update_status'})
    if res['status'] == 'success':
        return res['data'][0]
    else:
        status = initial_status()
        db.insert('status',status)
        return status

def get_status(provider):
    res = db.find('status',{'source':provider, 'type':'Provider'})
    if res['status'] == 'success':
        return res['data'][0]
    else:
        status = initial_status(provider)
        db.insert('status',status)
        return status

def check_update_status(provider):
    res = get_status(provider)
    ok = False
    s = None
    if res['status'] != 'Updating':
        ok = True
        s = res['status']
    return ok,s

def change_update_status(key, data):
    res = db.update('status',key,data)
    if res['status'].modified_count == 0:
        return False
    return True

def start_update(provider):

    ok,status = check_update_status(provider)

    if not ok:
        return False

    if not change_update_status({'source':provider, 'type':'Provider', 'status':status},{'status':'Updating','timestamp':time.time()}):
        return False

    return True

def fresh_machines(startime, provider):
    res = mg.get_machines({'provider_info.provider':provider, 'provider_info.last_state_update':{'$lt':startime}})
    res2 = mg.get_machines({'provider_info.provider':provider, 'provider_info.last_state_update':None})
    for machine in res:
        print("Removed",machine['ip'])
        mg.delete_machine({'ip':machine['ip']})
    for machine in res2:
        print("Removed",machine['ip'])
        mg.delete_machine({'ip':machine['ip']})

def update_provider_machines(provider):
    print(provider,"Updating")
    pro = provider
    try:
        res = get_provider_machines(pro)
        machine_data = res['data']
        suc = res['suc']
        error = res['error']
    except Exception as e:
        machine_data = []
        suc = False
        error = e
    startime = time.time()
    if suc != True:
        msg = {'status':'Failed','error':error,'number':len(machine_data)}
        change_update_status({'source':provider,'type':'Provider'},msg)
    else:
        for m in machine_data:
            ip = m['ip']
            data = mg.single_machine(m, None)['provider_info']
            updatemsg = {}
            if 'os' in m:
                updatemsg = {
                    'provider_info':data,
                    'os':m['os']
                }
            else:
                updatemsg = {
                    'provider_info':data
                }
            mg.update_machines({'ip':ip}, updatemsg, True)
        msg = {'status':'Updated','error':'','number':len(machine_data)}
        # msg = {'pros.'+pro:{'type':'Provider','status':'success','error':'','number':len(machine_data)}}
        change_update_status({'source':provider,'type':'Provider'},msg)
        fresh_machines(startime, provider)
    print(provider,"Updated")

def update_all_machines():
    pro_list = fmconfig.get_provider_list()
        
    for pro in pro_list:
        if start_update(pro):
            update_provider_machines(provider)
    return True