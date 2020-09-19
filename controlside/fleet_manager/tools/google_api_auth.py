import pickle
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

def authorize():
    creds = None

    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

    gscredpath = {
        'clientid':'/thunderpants/creds/google_clientid.json',
        'creds':'/thunderpants/creds/google_creds.dat',
        'pickle':'/thunderpants/creds/google_token.pickle',
    }

    if os.path.exists(gscredpath['pickle']):
        with open(gscredpath['pickle'],'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        ok = True
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print("%s"%(e))
                ok = False
        else:
            ok = False
        
        if not ok:
            try:
                os.system("rm "+gscredpath['pickle'])
            except:
                pass
            flow = InstalledAppFlow.from_client_secrets_file(
                gscredpath['clientid'], SCOPES
            )
            creds = flow.run_console(access_type='offline')

        with open(gscredpath['pickle'],'wb') as token:
            pickle.dump(creds, token)

    try:
        service = build('sheets', 'v4', credentials=creds)
        return True
    except Exception as e:
        print("%s"%(e))
        return False