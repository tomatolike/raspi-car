from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
import lib.tasks as tasks
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.machine_general as mg
import lib.datadef as datadef
import lib.diagnose_flow as diagnose_flow

@method_decorator(csrf_exempt, name="dispatch")
class DiagnoseView( View ):

    # api/diagnose/<ip>/
    # get the diagnose status of a machine
    def get( self, request, *args, **kwargs ):
        ip = kwargs.get("ip")

        realres = {
            'status':'',
            'data':[]
        }
        machine = mg.get_machines({'ip':ip})
        if len(machine) > 0 and machine[0].get('diagnose') != None:
            realres['status'] = machine[0]['diagnose']['status']
            realres['data'] = datadef.form_data("machine_diagnose",machine[0]['diagnose']['detail'])
        else:
            realres['status'] = False
            realres['data'] = {}

        return JsonResponse(realres)

    # api/diagnose/
    # try to diagnose the machines
    def post( self, request, *args, **kwargs ):

        ips = json.loads(request.body)
        # create diagnose task for each ip

        for ip in ips:
            if diagnose_flow.diagnose_start(ip):
                res = tasks.diagnose.delay(ip)
        return JsonResponse({"success":True})