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
from bson.objectid import ObjectId

class IssuesBase():
    def create_new_issue(self, data):
        return ig.create_new_issue(data)

    def add_new_chat(self, _id, data):
        return ig.add_new_chat(_id, data)

    def add_new_relation(self, _id, data):
        return ig.add_new_relation(_id, data)

    def change_issue_state(self, _id, status):
        return ig.change_issue_state(_id, status)

    def get_issue(self, key={}):
        return ig.get_issue(key)

    def close_relations(self, _id):
        return ig.close_relations(_id)

@method_decorator(csrf_exempt, name="dispatch")
class IssuesView( View, IssuesBase):

    # api/issues/
    # get all issues
    def get( self, request, *args, **kwargs):
        res = self.get_issue()
        issues = []
        if res['status'] == 'success':
            for issue in res['data']:
                newdata = datadef.form_data("issue_table",issue)
                issues.append(newdata)
        res = {
            'success':True,
            'response':issues
        }
        return JsonResponse(res)

    # api/issues/
    # create a new issue
    def post( self, request, *args, **kwargs):
        data = json.loads(request.body)
        res = {
            'success':False,
            'id':''
        }
        ok = self.create_new_issue(data)
        res['success'] = ok['status'].acknowledged
        if res['success']:
            res['id'] = str(ok['status'].inserted_id)
        return JsonResponse(res)

@method_decorator(csrf_exempt, name="dispatch")
class IssueView( View, IssuesBase ):

    # api/issue/
    # get the issue info
    def get( self, request, *args, **kwargs ):
        _id = kwargs.get("id")
        # print(_id)
        res = self.get_issue({"_id":ObjectId(_id)})
        issue = None
        if res['status'] == 'success':
            issue = datadef.form_data("issue_table",res['data'][0])
            issue['chats'] = []
            for chat in res['data'][0]['chats']:
                issue['chats'].append(datadef.form_data("issue_chat",chat))
        return JsonResponse(issue)

    # api/issue/
    # update the issue info in DB
    def post( self, request, *args, **kwargs ):

        ops = json.loads(request.body)

        res = True

        if ops['type'] == 'add_relation':
            relations = ops['relation']
            _id = ObjectId(ops['id'])
            # for relation in relations:
            #     res = (res and self.add_new_relation(_id, relation))
            res = self.add_new_relation(_id, relations)
        elif ops['type'] == 'add_new_chat':
            chatcontent = ops['chat']
            _id = ObjectId(ops['id'])
            chat = {
                'user':'unknow',
                'time':time.time(),
                'content':chatcontent
            }
            res = self.add_new_chat(_id, chat)
        elif ops['type'] == 'close_issue':
            _id = ObjectId(ops['id'])
            res = self.close_relations(_id)
            res = self.change_issue_state(_id, "closed")
        else:
            res = False

        return JsonResponse({'success':res})