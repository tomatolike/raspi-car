from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.hq_connector as hq_connector

@method_decorator(csrf_exempt, name="dispatch")
class MaintenanceView( View ):

    # api/maintenance/
    # change the maintenance of a machine
    def post( self, request, *args, **kwargs ):
        data = json.loads(request.body)

        realres = {
            'success':True,
            'data':[]
        }
        print(data)
        for ip in data.keys():
            realres['success'] = realres['success'] and hq_connector.change_hq_maintenance(ip,data[ip])

        return JsonResponse(realres)