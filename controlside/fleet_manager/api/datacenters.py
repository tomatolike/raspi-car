from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.datadef as datadef
import lib.datacenter_general as dg

class DatacenterBase():
    def get_datacenter(self,key={}):
        # print(type(key))
        return dg.get_datacenter(key)

    def update_datacenters(self,key,data,upsert=False):
        return dg.update_datacenters(key,data,upsert)

    def refresh(self):
        dg.refresh()

@method_decorator(csrf_exempt, name="dispatch")
class DatacentersView( View, DatacenterBase):

    # api/datacenters/
    def get( self, request, *args, **kwargs):
        datacenters = self.get_datacenter()

        res = {
            'success':True,
            'response':[]
        }
        
        for m in datacenters:
            newdata = datadef.form_data("datacenter_table",m)
            res['response'].append(newdata)
        
        return JsonResponse(res)

    # api/datacenters/
    # refresh datacenter infos
    def post( self, request, *args, **kwargs ):

        self.refresh()

        msg = {
            "success":True
        }

        return JsonResponse(msg)