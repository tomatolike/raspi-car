import json
import os
from datetime import datetime
from bson.objectid import ObjectId

datadef = None
defpath = os.path.abspath( os.path.join( os.path.dirname( __file__ ), "..", "config" ) )

def get_def():
    global datadef,defpath
    f = open(defpath+"/datadef.json","r")
    datadef = json.load(f)
    f.close()

def get_data_value(data, path, ty=None):
    keys = path.split(".")
    value = data
    # print(keys)
    if value == None:
        return value
    for key in keys:
        # print(value.keys())
        if key not in value.keys():
            return None
        value = value[key]
    return transfer_type(ty,value)

def transfer_type(ty, data):
    if ty == 'time':
        if type(data) == int or type(data) == float:
            return datetime.fromtimestamp(data).strftime("%y/%m/%d %H:%M:%S")
    elif ty == 'json':
        if type(data) == dict or type(data) == list:
            return json.dumps(data)
    elif ty == 'objectid':
        if type(data) == ObjectId:
            return str(data)
    elif ty == 'list_number':
        if type(data) == list:
            return len(data)
    elif ty == 'list_empty_join':
        if type(data) == list:
            return ' '.join(data)
    elif ty == 'issue_array':
        if type(data) == list:
            res = []
            for d in data:
                d['issue_id'] = str(d['issue_id'])
                res.append(d)
            return res
    else:
        return data
    return data

def form_data(defname, oridata):
    # print(defname, oridata)
    global datadef
    if datadef == None:
        get_def()
    thedef = datadef[defname]

    if thedef['type'] == 'project':

        data = {}

        keys = thedef['def'].keys()
        for key in keys:
            data[key] = get_data_value(oridata, thedef['def'][key]['path'], thedef['def'][key].get('type'))
            
        return data

    elif thedef['type'] == 'transfer':

        data = []

        for key in oridata.keys():
            temp = {}
            for realkey in thedef['def'].keys():
                if thedef['def'][realkey]['path'] == 'key':
                    temp[realkey]=transfer_type(thedef['def'][realkey].get('type'),key)
                else:
                    paths = thedef['def'][realkey]['path'].split('.')
                    paths[0] = key
                    temp[realkey] = get_data_value(oridata, '.'.join(paths), thedef['def'][realkey].get('type'))
            data.append(temp)
        return data

    else:
        return None
