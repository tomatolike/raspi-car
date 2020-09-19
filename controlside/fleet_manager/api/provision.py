from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import lib.tasks as tasks
import lib.machine_general as mg
import lib.datadef as datadef
import lib.provision_flow as provision_flow

@method_decorator(csrf_exempt, name="dispatch")
class ProvisionView( View ):

    # GET api/provision/ip
    # get a machine's provision result
    def get( self, request, *args, **kwargs):
        
        ip = kwargs.get("ip")
        print("Get Provision Data For:"+ip)
        res = {
            'status':'',
            'result':[]
        }
        machine = mg.get_machines({'ip':ip})

        if len(machine) <= 0:
            return JsonResponse(res)

        if machine[0].get('provision') != None:
            res = machine[0].get('provision')
            temp = []
            for content in res['result']:
                temp.append({'content':content})
            res['result'] = temp
        else:
            res['status'] = ''
            res['result'] = []
        
        return JsonResponse(res)

    # POST api/provision
    # provision a machine
    def post( self, request, *args, **kwargs):
        data = json.loads(request.body)
        print(data)
        _ips = data['ips']
        _env = data['aimedenv']
        for _ip in _ips:
            if provision_flow.provision_start(_ip):
                res = tasks.provision_machine.delay(_ip, _env)
        return JsonResponse({'success':True})