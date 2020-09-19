import lib.machine_general as mg
import lib.provider_connector as provider_connector
import lib.hq_connector as hq_connector
import lib.tasks as tasks
import lib.fmconfig as fmconfig

def get_status():
    res = []
    hqlist = fmconfig.get_hq_list()
    for hq in hqlist:
        res.append(hq_connector.get_status(hq))
    pro_list = fmconfig.get_provider_list()
    for pro in pro_list:
        res.append(provider_connector.get_status(pro))
    
    return res

def update(source, stype):
    if stype == "Provider":
        if provider_connector.start_update(source):
            tasks.update_provider_machines.delay(source)
    elif stype == "HQ":
        if hq_connector.start_update(source):
            tasks.update_hq_machines.delay(source)
    