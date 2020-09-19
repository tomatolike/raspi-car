from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.hq_connector as hq_connector

@method_decorator(csrf_exempt, name="dispatch")
class TagsView( View ):

    # api/tags/<ip>/
    # change the tags of a machine
    def post( self, request, *args, **kwargs ):
        ip = kwargs.get("ip")
        value = json.loads(request.body)

        realres = {
            'success':False,
            'data':[]
        }

        realres['success'] = hq_connector.change_hq_tags(ip,value)

        return JsonResponse(realres)