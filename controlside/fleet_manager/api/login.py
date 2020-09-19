from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import time
from datetime import datetime
import lib.datadef as datadef
import lib.issue_general as ig
import lib.user_general as user_general
from django.contrib import auth

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):

    def get( self, request, *args, **kwargs ):
        res = {
            'success':True
        }
        return JsonResponse(res)

    def post( self, request, *args, **kwargs ):
        data = json.loads(request.body)

        uname = data['username']
        pwd = data['password']

        res = {
            'success':False
        }

        if user_general.auth(uname, pwd):
            auth.login(request,data)
            res['success'] = True
            return JsonResponse(res)
        else:
            return JsonResponse(res)



