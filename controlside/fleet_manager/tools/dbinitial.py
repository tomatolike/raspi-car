import pymongo

def initial():
    try:
        client = pymongo.MongoClient("localhost")
        db = client["fleet_manager"]

        # clear and initial the machines collection
        coll = db["machines"]
        coll.drop()
        print("Machines Clean")

        # clear and initial the status collection
        coll = db["status"]
        coll.drop()
        print("Status Clean")
        # coll.update_one({"id":"hq_update_status"},{"$set":{"status":"Updated","hqs":{}}},upsert=True)
        # coll.update_one({"id":"provider_update_status"},{"$set":{"status":"Updated","pros":{}}},upsert=True)
        # print("Status Initialed")

        # Clear the migrations collection
        coll = db["migration"]
        coll.drop()
        print("Migration Clean")

        # Clear the issues collection
        coll = db["issue"]
        coll.drop()
        print("Issues Clean")

        return True
    except Exception as e:
        print("%s"%(e))
        return True