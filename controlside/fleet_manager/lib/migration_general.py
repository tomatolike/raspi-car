import lib.db as db
import lib.hq_connector as hq_connector
import lib.machine_general as mg
import json
from datetime import datetime
from bson.objectid import ObjectId
import time

def create_new_migration(data):
    migration = {
        'aim_env':data['aimedenv'],
        'time': datetime.fromtimestamp(time.time()).strftime("%y/%m/%d %H:%M:%S"),
        'finished': False,
        'machines':[]
    }
    for m in data['machines']:
        m['new_env'] = data['aimedenv']
        m['status'] = False
        migration['machines'].append(m)
    res = db.insert("migration",migration)
    return res, migration

def update_machine_status(migration, ip, status):
    res = db.update("migration", 
        {"_id":ObjectId(migration),"machines.ip":ip},
        {'machines.$.status':status}
    )
    if status == True:
        mg.update_machines({'ip':ip}, {'migration.status':'Migrated'})
    if status == "Failed":
        mg.update_machines({'ip':ip}, {'migration.status':'Failed'})
    return res

def get_migration(key={}):
    res = db.find("migration", key, f=None)
    return res

def check_migration_finished(migration):
    ok = True
    print("Check Migration "+str(migration['_id']))
    for machine in migration['machines']:
        if machine['status'] == False:
            # check the data in DB first
            m = mg.get_machines({'ip':machine['ip']})[0]
            # print(m)
            if m['tp_info']['last_env'] == machine['new_env']:
                # print("The Aim is the same with current")
                update_machine_status(str(migration['_id']),machine['ip'],True)
                continue

            # if not, ask the HQ
            res = hq_connector.get_one_machine_from_hq(machine['ip'],machine['new_env'])
            # print(res)
            if res['status'] == 'success' and res['data']['connected'] == True:
                update_machine_status(str(migration['_id']),machine['ip'],True)
                # update the machiens table too
                m = {}
                m['ip'] = res['data']['ip']
                m['state'] = res['data']
                m['hq'] = machine['new_env']
                m['tags'] = []
                mdata = mg.single_machine(None, m)['tp_info']
                # print("update machine",mdata)
                mg.update_machines({'ip':machine['ip']}, {'tp_info':mdata})
            else:
                # check if time out
                oldtime = m['migration']['timestamp']
                nowtime = time.time()
                if nowtime - oldtime > 600:
                    print("Time out "+machine['ip']+" %d %d "%(nowtime,oldtime))
                    update_machine_status(str(migration['_id']),machine['ip'],"Failed")
                else:
                    ok = False
    if ok:
        res = db.update("migration", {"_id":migration['_id']}, {'finished':True})
        # print("Migration Done")
    print("Check Finished")

def one_migration_check(_id):
    res = get_migration({'_id':ObjectId(_id)})
    if res['status'] == 'success':
        migration = res['data'][0]
        check_migration_finished(migration)

def migration_check():
    res = get_migration()
    if res['status'] == 'success':
        migrations = res['data']
        for m in migrations:
            if m['finished'] == False:
                check_migration_finished(m)