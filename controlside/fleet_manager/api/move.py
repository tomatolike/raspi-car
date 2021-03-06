from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import lib.network_interface as ni

@method_decorator(csrf_exempt, name="dispatch")
class MoveView( View ):

    # api/move/
    def get( self, request, *args, **kwargs ):
        msg = {
            "success":True,
            "data":ni.status()
        }
        print(msg)
        return JsonResponse(msg)

    # api/move/
    def post( self, request, *args, **kwargs ):

        data = json.loads(request.body)

        print(data)        

        dic = {
            'W':'forward',
            'S':'back',
            'A':'left',
            'D':'right',
            'stop':'stop'
        }

        data['order'] = dic[data['order']]

        msg = {
            "success":ni.send(data)
        }

        return JsonResponse(msg)