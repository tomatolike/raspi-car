from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import lib.fmconfig as fmconfig
import lib.datadef as datadef
import lib.hq_connector as hq_connector
import lib.provider_connector as provider_connector
import lib.db as db
import json
from django.views import View
from datetime import datetime
import lib.tasks as tasks
import lib.machine_general as mg
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.issue_general as ig
# Create your views here.

class MachineBase:

    def single_machine(self, provider, tp):
        return mg.single_machine(provider, tp)

    def get_machines(self, key):
        return mg.get_machines(key)

    def update_machines(self, key, data, upsert):
        return mg.update_machines(key,data,upsert)

    def clear_machines(self):
        return mg.clear_machines()

@method_decorator(csrf_exempt, name="dispatch")
class MachinesView( View, MachineBase):

    # GET api/machines/
    # get all machines in DB
    def get( self, request, *args, **kwargs ):
        print("get machines:",request.user)
        hq = kwargs.get("hq")
        provider = kwargs.get("provider")
        key = {}
        if hq != "all":
            if hq == "no_hq":
                key['tp_info.last_env'] = None
            else:
                key['tp_info.last_env'] = hq
        if provider != "all":
            if provider == "no_provider":
                key['provider_info.provider'] = None
            else:
                key['provider_info.provider'] = provider
        machines = self.get_machines(key)
        data = []
        for m in machines:
            data.append(datadef.form_data("machine_table",m))
        res = {
            'success':True,
            'response':data
        }
        return JsonResponse(res)

    # POST api/machines/
    # update DB from HQs&Providers
    def post( self, request, *args, **kwargs ):

        updatetype = kwargs.get("updatetype")
        # print("Updating", updatetype)
        if updatetype == 'hq':
            result = tasks.hq_machines_update.delay()
        elif updatetype == 'provider':
            result = tasks.provider_machines_update.delay()

        res = {
            'scheduled':True
        }

        return JsonResponse(res)

@method_decorator(csrf_exempt, name="dispatch")
class MachineView( View, MachineBase):

    # GET api/machine/ip
    # get the machine in DB
    def get( self, request, *args, **kwargs ):
        ip = kwargs.get("ip")
        
        print("fetch ip",ip)
        machine = self.get_machines({'ip':ip})
        data = None
        ok = False
        if len(machine) > 0:
            ok = True
            data = datadef.form_data("machine_table",machine[0])
            ids = []
            if data['issues_list'] != None:
                for issue in data['issues_list']:
                    ids.append(issue['issue_id'])
            issues = ig.get_issues_by_ids(ids)
            data['issues'] = []
            for issue in issues:
                data['issues'].append(datadef.form_data("issue_table",issue))
        res = {
            'success':ok,
            'response':data
        }
        print(res)
        return JsonResponse(res)