from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views import View
import lib.hq_connector as hq_connector
import lib.datadef as datadef
import lib.provider_connector as provider_connector
import lib.machine_general as mg
import lib.fmconfig as fmconfig
import lib.status_general as sg
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json

@method_decorator(csrf_exempt, name="dispatch")
class StatusView( View ):

    # api/status/<id>/
    # get the status update of some info
    def get( self, request, *args, **kwargs ):
        statusid = kwargs.get("status_id")

        realres = {
            'status':'',
            'data':[]
        }

        if statusid == 'update_status':
            statuses = sg.get_status()
            for status in statuses:
                realres['data'].append(datadef.form_data("update_status", status))

        return JsonResponse(realres)

    # api/status/update/
    # update from some source
    def post( self, request, *args, **kwargs ):
        data = json.loads(request.body)
        realres = {
            'status':'',
            'data':[]
        }
        for one in data:
            sg.update(one['source'],one['type'])
        realres['status'] = 'success'
        return JsonResponse(realres)

class EnvSelectView( View ):
    
    # GET api/envselect/
    # get the selectable list of environments
    def get( self, request, *args, **kwargs ):
        hqlist = fmconfig.get_hq_list(full=False)
        res = {
            'status':'success',
            'data':[]
        }
        for hq in hqlist:
            res['data'].append(
                {
                    'value':hq,
                    'label':hq
                }
            )
        return JsonResponse(res)

class ProviderSelectView( View ):

    # GET api/proselect/
    # get the selectable list of providers
    def get( self, request, *args, **kwargs ):
        providerlist = fmconfig.get_provider_list()
        res = {
            'status':'success',
            'data':[]
        }
        for provider in providerlist:
            res['data'].append(
                {
                    'value':provider,
                    'label':provider
                }
            )
        return JsonResponse(res)