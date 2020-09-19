import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import lib.fmconfig as fmconfig
# import fmconfig as fmconfig

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

creds = None

def authorize():
    global creds
    gscredpath = fmconfig.get_gs_creds()

    if creds == None:

        if os.path.exists(gscredpath['pickle']):
            with open(gscredpath['pickle'],'rb') as token:
                creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except:
                return None
        else:
            return None

        with open(gscredpath['pickle'],'wb') as token:
            pickle.dump(creds, token)
    
    return creds

def readdata(sheet_id, range):

    _creds = authorize()

    res = {
        'data':[],
        'suc':True,
        'error':""
    }

    if _creds == None:
        res['suc'] = False
        res['error'] = "Authorize Failed. Please re-authorize the token."
        return res

    service = build('sheets', 'v4', credentials=_creds, cache_discovery=False)

    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=sheet_id, range=range).execute()
    values = result.get('values',None)

    if not values:
        res['suc'] = False
        res['error'] = "No Data Found"
        return res
    else:
        print(type(values))
        res['data'] = values[1:-1]
        return res