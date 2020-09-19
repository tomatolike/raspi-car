import subprocess
import lib.machine_general as mg
import lib.diagnose_flow as diagnose_flow
import select
import time
import lib.fmconfig as fmconfig
import lib.datadef as df

def read_brief(ip, messages):
    brief = ""
    for m in messages:
        brief += m+"\n"
    mg.update_machines({'ip':ip},{'provision.brief':brief})

def read_output(process,ip):
    poll_obj = select.poll()
    poll_obj.register(process.stdout, select.POLLIN)
    brief = []
    while True:
        poll_res = poll_obj.poll(0)
        if poll_res:
            temp = process.stdout.readline()
            mg.apeend_item(ip, 'provision.result', temp.decode('utf-8'))
            if len(brief) == 1:
                brief = brief[1:]
            brief.append(temp.decode('utf-8'))
            read_brief(ip,brief)
            if process.poll() != None:
                break
        else:
            if process.poll() != None:
                break
    return process.poll(), brief

def readerror(process,ip):
    errors = process.stderr.readlines()
    brief = []
    for error in errors:
        if len(brief) == 1:
            brief = brief[1:]
        brief.append(error.decode('utf-8'))
        mg.apeend_item(ip, 'provision.result', error.decode('utf-8'))
    read_brief(ip,brief)

def check_provision_status(ip):
    res = mg.get_machines({'ip':ip})
    ok = False
    s = None
    for m in res:
        if 'provision' not in m.keys():
            temp = mg.single_machine()
            mg.update_machines({'ip':ip},{'provision':temp['provision']})
            ok = True
            s = temp['provision']['status']
        else:
            s = m['provision']['status']
            if m['provision']['status'] != 'Provisioning':
                ok = True
    return ok,s

def change_provision_status(ip,old,status):
    res = mg.update_machines({'ip':ip,'provision.status':old},{'provision.status':status})
    if res['status'].modified_count == 0:
        return False
    return True

def provision_start(ip):
    provision = {
        'status':'Provisioning',
        'brief':"Provisioning",
        'result':[],
        'timestamp':time.time()
    }
    ok,status = check_provision_status(ip)

    if not ok:
        return False

    if not change_provision_status(ip, status, "Provisioning"):
        return False

    mg.update_machines({'ip':ip},{'provision':provision})
    return True

def provision(ip, env):

    provision = {
        'status':'Provisioning',
        'brief':"Provisioning",
        'result':[],
        'timestamp':time.time()
    }
    # ok,status = check_provision_status(ip)

    # if not ok:
    #     return True

    # if not change_provision_status(ip, status, "Provisioning"):
    #     return True

    # mg.update_machines({'ip':ip},{'provision':provision})
    # Try to get OS info
    # os = mg.get_machine_os(ip)
    machine = mg.get_machines({'ip':ip})[0]
    os = df.get_data_value(machine,'os')
    if os == None:
        # need do diagnose to detect os
        print("No OS info, need diagnose first")
        mg.update_machines({'ip':ip},{'provision.brief':"No OS info, need diagnose first"})
        mg.apeend_item(ip, 'provision.result', "No OS info, need diagnose first")
        if diagnose_flow.diagnose_start(ip):
            diagnose_flow.diagnose(ip)
        else:
            while True:
                ok,s = diagnose_flow.check_provision_status(ip)
                if ok:
                    break
                else:
                    time.sleep(5)
                
    os = mg.get_machine_os(ip)
    if os == None:
        print("No OS can be found. Quit.")
        provision = {
            'status':'Failed',
            'brief':"No OS info can be found. Please see Diagnose result",
            'result':['No OS info can be found. Please see Diagnose result']
        }
        mg.update_machines({'ip':ip},{'provision':provision})
    else:

        # Start Provisioning
        command = "python3 make_machine.py --env " + env + " --os " + os + " --provider bare --bare-ip " + ip + " --pre-auth " + fmconfig.get_ssh_keys()
        if df.get_data_value(machine,'provider_info.provider') == "GameServers":
            command += " --pre-auth-port 2200 "
            command += " --bare-provider gs "
        elif df.get_data_value(machine,'provider_info.provider') == "Multiplay":
            command += " --bare-provider mp "

        print(command)
        process = subprocess.Popen(command, shell=True, cwd="/thunderpants/scripts/provisioning/machine/", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Provision Process Started")
        returncode,brief = read_output(process,ip)
        if returncode != 0:
            readerror(process,ip)
            mg.update_machines({'ip':ip},{'provision.status':'Failed'})
        else:
            # print(brief[0])
            # if brief[0] == ip:
            #     mg.update_machines({'ip':ip},{'provision.status':'Done'})
            # else:
            #     mg.update_machines({'ip':ip},{'provision.status':'Failed'})
            mg.update_machines({'ip':ip},{'provision.status':'Done'})
    print("Provision Finished")
        