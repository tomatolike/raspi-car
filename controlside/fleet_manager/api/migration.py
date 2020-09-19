from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
import lib.tasks as tasks
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import time
from datetime import datetime
import lib.machine_general as mg
import lib.hq_connector as hq_connector
import lib.db as db
from bson.objectid import ObjectId
import lib.migration_general as mig
import lib.datadef as datadef

class MigrationBase():
    def create_new_migration(self, data):
        return mig.create_new_migration(data)

    def update_machine_status(self, migration, ip, status):
        return mig.update_machine_status(migration, ip, status)

    def get_migration(self, key={}):
        return mig.get_migration(key)

@method_decorator(csrf_exempt, name="dispatch")
class MigrationsView( View, MigrationBase):

    # api/migrations/
    def get( self, request, *args, **kwargs):
        res = self.get_migration()
        migrations = []
        if res['status'] == 'success':
            for m in res['data']:
                print(m)
                newdata = datadef.form_data("migration_table",m)
                migrations.append(newdata)
        res = {
            'success':True,
            'response':migrations
        }
        return JsonResponse(res)

    # api/migrations/
    # try to migrate the machines from one HQ to the other
    def post( self, request, *args, **kwargs ):

        data = json.loads(request.body)

        msg = {
            "success":True,
            "migration":""
        }

        # create a Migration in the db
        res, migration = self.create_new_migration(data)
        if res['status'].acknowledged == True:
            msg["migration"] = "%s"%(res['status'].inserted_id)
            msg["success"] = True
        else:
            msg['success'] = False

        # start call apis
        for m in migration['machines']:
            machine = m
            # print("migrate",machine['ip'])
            ok = hq_connector.migrate(machine['ip'],machine['last_env'],machine['new_env'])
            if not ok:
                self.update_machine_status(msg["migration"], machine['ip'], "Failed")

        return JsonResponse(msg)


@method_decorator(csrf_exempt, name="dispatch")
class MigrationView( View, MigrationBase ):

    # api/migrate/
    # get the migration info
    def get( self, request, *args, **kwargs ):
        _id = kwargs.get("id")
        # print(_id)
        res = self.get_migration({"_id":ObjectId(_id)})
        migration = None
        if res['status'] == 'success':
            migration = datadef.form_data("migration_table",res['data'][0])
            migration['machines'] = res['data'][0]['machines']
        return JsonResponse(migration)

    # api/migrate/
    # update the migration info in DB
    def post( self, request, *args, **kwargs ):
        _id = json.loads(request.body)[0]

        res = tasks.one_migration_check.delay(_id)

        return JsonResponse({'success':True})