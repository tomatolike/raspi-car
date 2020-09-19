import pymongo
import lib.fmconfig as fmconfig

dbclient = None
dbname = "fleet_manager"

def create_conn():
    global dbclient
    if dbclient == None:
        dbclient = pymongo.MongoClient(fmconfig.get_db_url())

def close_conn():
    global dbclient
    if dbclient != None:
        dbclient.close()

def db_check(collection):
    global dbclient,dbname
    create_conn()
    colist = dbclient[dbname].list_collection_names()
    if collection not in colist:
        return False
    return True

def find(collection, key, f={'_id':0}):
    global dbclient,dbname
    res = {"status":"","data":None}
    if not db_check(collection):
        res["status"] = "failed"
        return res
    # print(type(key))
    items = dbclient[dbname][collection].find(key,f)
    if items.count() > 0:
        res["status"] = "success"
        res["data"] = items
    else:
        res["status"] = "failed"
        res["data"] = items
    return res

def update(collection, key, data, _upsert=False):
    global dbclient,dbname
    res = {"status":"","data":None}
    create_conn()
    res["status"] = dbclient[dbname][collection].update_one(key, {'$set':data}, upsert=_upsert)
    return res

def increase(collection, key, data):
    global dbclient,dbname
    res = {"status":"","data":None}
    create_conn()
    res["status"] = dbclient[dbname][collection].update_one(key, {'$inc':data})
    return res

def append(collection, key, data):
    global dbclient,dbname
    res = {"status":"","data":None}
    create_conn()
    res["status"] = dbclient[dbname][collection].update_one(key, {'$push':data})
    return res

def pull(collection, key, data):
    global dbclient,dbname
    res = {"status":"","data":None}
    create_conn()
    res["status"] = dbclient[dbname][collection].update_one(key,{'$pull':data})
    return res

def insert(collection, data):
    global dbclient,dbname
    res = {"status":"","data":None}
    create_conn()
    res["status"] = dbclient[dbname][collection].insert_one(data)
    return res

def drop(collection):
    global dbclient, dbname
    create_conn()
    dbclient[dbname][collection].drop()

def count(collection, key):
    global dbclient,dbname
    create_conn()
    return dbclient[dbname][collection].count(key)

def sum(collection, _filter, key):
    global dbclient,dbname
    create_conn()
    # print("SUM on", _filter, " with ", key)
    agr = [{'$match':_filter},{'$group':{'_id':1,'all':{'$sum':'$'+key}}}]
    res = dbclient[dbname][collection].aggregate(agr)
    val = list(res)
    if(len(val) > 0):
        return val[0]['all']
    else:
        return 0

def delete(collection, key):
    global dbclient, dbname
    create_conn()
    return dbclient[dbname][collection].delete_one(key)