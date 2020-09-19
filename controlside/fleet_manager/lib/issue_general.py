import lib.db as db
import lib.hq_connector as hq_connector
import lib.machine_general as mg
import lib.datacenter_general as dg
import json
from datetime import datetime
from bson.objectid import ObjectId
import time

def create_new_issue(data):
    new_issue = {
        'topic':data.get('topic'),
        'start_time':time.time(),
        'last_update':time.time(),
        'related':[],
        'status':'open',
        'chats':[]
    }
    if new_issue['topic'] == None:
        return False
    res = db.insert("issue", new_issue)
    return res
    
def update_time(_id):
    res = db.update("issue", {'_id':_id}, {'last_update':time.time()})
    return res['status'].acknowledged

def add_new_chat(_id, data):
    res = db.append("issue", {'_id':_id}, {'chats':data})
    update_time(_id)
    return res['status'].acknowledged

def get_issue(key={}):
    res = db.find("issue", key, f=None)
    return res

def add_new_relation(_id, data):
    res = get_issue({'_id':_id})
    if res['status'] == 'success':
        issue = res['data'][0]
        topic = issue['topic']
        update_time(_id)
        relations = issue['related']
        for newone in data:
            if newone not in relations:
                print("New relation",newone)
                db.append("issue", {'_id':_id}, {'related':newone})
                if '.' in newone:
                    mg.add_issue_related(newone,_id,topic)
                elif 'mp' in newone or 'gs' in newone or 'blizzard' in newone:
                    dg.add_issue_related(newone,_id,topic)
        for oldone in relations:
            if oldone not in data:
                db.pull("issue",{'_id':_id},{"related":oldone})
                if '.' in oldone:
                    mg.clear_issue_relation(oldone, _id)
                elif 'mp' in oldone or 'gs' in oldone or 'blizzard' in oldone:
                    dg.clear_issue_relation(oldone, _id)
    return True
    # res = db.append("issue", {'_id':_id}, {'related':data})
    # topic = get_issue({'_id':_id})['data'][0]['topic']
    # update_time(_id)
    # if '.' in data:
    #     mg.add_issue_related(data,_id,topic)
    # elif 'mp' in data or 'gs' in data or 'blizzard' in data:
    #     dg.add_issue_related(data,_id,topic)
    # return res['status'].acknowledged

def change_issue_state(_id, status):
    res = db.update("issue", {'_id':_id}, {'status':status})
    update_time(_id)
    return res['status'].acknowledged

def close_relations(_id):
    issue = get_issue({'_id':_id})['data'][0]
    for relation in issue['related']:
        if '.' in relation:
            mg.clear_issue_relation(relation, _id)
        elif 'mp' in relation or 'gs' in relation or 'blizzard' in relation:
            dg.clear_issue_relation(relation, _id)
    return True

def get_issues_by_ids(ids):
    if ids == None:
        return []

    data = []
    for _id in ids:
        res = get_issue({'_id':ObjectId(_id)})
        for issue in res['data']:
            data.append(issue)
    
    return data