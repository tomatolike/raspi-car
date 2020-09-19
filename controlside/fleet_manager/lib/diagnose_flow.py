import lib.machine_general as mg
import lib.fmconfig as fmconfig
import os
import socket
import json
import paramiko
import subprocess
import time


def check_provision_status(ip):
    res = mg.get_machines({'ip':ip})
    ok = False
    s = None
    for m in res:
        if 'diagnose' not in m.keys():
            temp = mg.single_machine()
            mg.update_machines({'ip':ip},{'diagnose':temp['diagnose']})
            ok = True
            s = temp['diagnose']['status']
        else:
            s = m['diagnose']['status']
            if m['diagnose']['status'] != 'Diagnosing':
                ok = True
    return ok,s

def change_provision_status(ip,old,status):
    res = mg.update_machines({'ip':ip,'diagnose.status':old},{'diagnose.status':status})
    if res['status'].modified_count == 0:
        return False
    return True

def ping_machine(ip):
    suc = 0
    for i in range(0,10):
        res = subprocess.run("ping -c 1 " + ip, shell=True, stdout=subprocess.DEVNULL)
        # res = os.system("ping -c 1 " + ip)
        if res.returncode == 0:
            suc += 1
    if suc < 8:
        return False
    return True

def check_machine_port(ip, port):
    ok = True
    msg = "checking port %d ..."%(port)
    s = socket.socket()
    s.settimeout(10)
    try:
        s.connect((ip, port))
        msg = "Success"
    except Exception as e:
        msg = "%s"%(e)
        ok = False
    finally:
        s.close()
    return ok, msg

def do_command_check(ssh, command):
    print(command)
    stdin, stdout, stderr = ssh.exec_command(command)
    res = ""
    for line in stdout:
        res += line
    print(res)
    return res

def test_ssh(ip, port, uname):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    keyfile = fmconfig.get_ssh_keys()
    ok = False
    msg = ""
    try:
        ssh.connect(ip, port=port, username=uname, key_filename=keyfile, timeout=10)
        ok = True
    except Exception as e:
        msg = "%s"%(e)
        ok = False
    finally:
        ssh.close()
    return ok,msg


def check_ssh(ip, ports):
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ok = True
    unames = ['Administrator','ubuntu']
    keyfile = fmconfig.get_ssh_keys()
    msg = ""
    commands = {
        'ping_google':'',
        'pw_cfg':'',
        'netstat':''
    }
    os = "none"
    for port in ports:
        for uname in unames:
            try:
                print("checking ssh for %s %d %s"%(ip,port,uname))
                ssh.connect(ip, port=port, username=uname, key_filename=keyfile, timeout=10)
                msg = "Success"
                ok = True

                # transport = ssh.get_transport()
                # banner = transport.remote_version

                if uname == 'ubuntu':
                    print("checking commands for Linux")
                    os = "linux"
                    mg.update_os(ip,"linux")
                    commands['ping_google'] = do_command_check(ssh,'ping -c 1 google.com | grep transmitted')
                    commands['pw_cfg'] = do_command_check(ssh,'ls /etc/pw/pw.cfg')
                    commands['netstat'] = do_command_check(ssh,'netstat -an | grep 44444')
                else:
                    print("checking commands for Win")
                    os = "windows"
                    mg.update_os(ip,"windows")
                    commands['ping_google'] = do_command_check(ssh,'ping -n 1 google.com | findstr Lost')
                    commands['netstat'] = do_command_check(ssh,'netstat -an | findstr 44444')

                print("commands checked")

            except Exception as e:
                msg = "%s"%(e)
                ok = False
                print("%s %d %s failed %s"%(ip,port,uname,msg))
                commands['ping_google'] = "Skip"
                commands['netstat'] = "Skip"
            finally:
                ssh.close()
            if ok:
                print("%s %d %s success"%(ip,port,uname))
                return ok,msg,commands,os
        if ok:
            return ok,msg,commands,os

    return ok,msg,commands,os

def check_commands_done(key, res):
    if key == 'ping_google':
        if '100%' in res:
            return False
        return True
    elif key == 'netstat':
        if 'ESTABLISHED' not in res:
            return False
        return True
    elif key == 'pw_cfg':
        if 'pw.cfg' not in res:
            return False
        return True
    else:
        return False

def make_error_msg(msg):
    # res = ""
    # res += 'ping : ' + msg['ping'] + ";\n"
    # res += 'port 22 : ' + msg['port 22'] + ";\n"
    # res += 'port 2200 : ' + msg['port 2200'] + ";\n"
    # res += 'ssh : ' + msg['ssh'] + ";\n"
    # return res
    return msg

def diagnose_start(ip):
    # check if the machine is already in diagnose
    print("Diagnose: "+ip)
    ok,status = check_provision_status(ip)
    print(ok,status)
    if not ok:
        return False

    if not change_provision_status(ip, status, "Diagnosing"):
        return False

    finalmsg = {
        "ping":"Checking",
        "port 22":"Checking",
        "port 2200":"Checking",
        "ssh":"Checking"
    }
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
    mg.update_machines({'ip':ip}, {'diagnose.error':'Checking Ping'})
    mg.update_machines({'ip':ip}, {'diagnose.timestamp':time.time()})
    return True

def diagnose(ip):
    # # check if the machine is already in diagnose
    # print("Diagnose: "+ip)
    # ok,status = check_provision_status(ip)
    # if not ok:
    #     return True

    # if not change_provision_status(ip, status, "Diagnosing"):
    #     return True

    finalmsg = {
        "ping":"Checking",
        "port 22":"Checking",
        "port 2200":"Checking",
        "port 5985":"Checking",
        "port 3389":"Checking",
        "ssh":"Checking"
    }
    # mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
    # mg.update_machines({'ip':ip}, {'diagnose.error':'Checking Ping'})
    # mg.update_machines({'ip':ip}, {'diagnose.timestamp':time.time()})

    # try to ping the machine
    if not ping_machine(ip):
        finalmsg['ping'] = "Failed"
        finalmsg['port 22'] = "Failed"
        finalmsg['port 2200'] = "Failed"
        finalmsg['port 5985'] = "Failed"
        finalmsg['port 3389'] = "Failed"
        finalmsg['ssh'] = "Failed"
        mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
        mg.update_machines({'ip':ip}, {'diagnose.error':'Ping Failed'})
        print("Diagnose End")
        return change_provision_status(ip, "Diagnosing", "Diagnosed") 
    else:
        finalmsg['ping'] = "Success"
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
    mg.update_machines({'ip':ip}, {'diagnose.error':'Checking Ports'})

    okport = []
    # try to check port 2200
    ok,msg = check_machine_port(ip,2200)
    finalmsg['port 2200'] = msg
    if ok:
        okport.append(2200)
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})

    # try to check port 22
    err = ""
    ok,msg = check_machine_port(ip,22)
    finalmsg['port 22'] = msg
    if ok:
        okport.append(22)
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})

    # try to check port 5985
    ok,msg = check_machine_port(ip,5985)
    finalmsg['port 5985'] = msg
    if ok:
        okport.append(5985)
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})

    # try to check port 3389
    ok,msg = check_machine_port(ip,3389)
    finalmsg['port 3389'] = msg
    if ok:
        okport.append(3389)
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})

    sshports = []
    if 22 not in okport and 2200 not in okport:
        if len(okport) == 0:
            finalmsg['ssh'] = "Failed"
            mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
            mg.update_machines({'ip':ip}, {'diagnose.error':'No Open Ports'})
            print("Diagnose End")
            return change_provision_status(ip, "Diagnosing", "Diagnosed")
        else:
            finalmsg['ssh'] = "Failed"
            mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
            mg.update_machines({'ip':ip}, {'diagnose.error':'No SSH Ports, Open Ports Are:'+" ".join([str(n) for n in okport])})
            print("Diagnose End")
            return change_provision_status(ip, "Diagnosing", "Diagnosed")
    else:
        for n in okport:
            if n == 22 or n == 2200:
                sshports.append(n)
    
    mg.update_machines({'ip':ip}, {'diagnose.error':'Checking SSH'})
    
    # try to check make ssh connection
    ok,msg,commands,os = check_ssh(ip,sshports)
    finalmsg['ssh'] = msg
    for key in commands.keys():
        finalmsg[key] = commands[key]
    mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
    if not ok:
        mg.update_machines({'ip':ip}, {'diagnose.error':'SSH Failed'})
    else:
        if os == "linux":
            if not check_commands_done('pw_cfg',commands['pw_cfg']):
                mg.update_machines({'ip':ip}, {'diagnose.error':'Not Provisioned'})
            else:
                if not check_commands_done('ping_google',commands['ping_google']) or not check_commands_done('netstat',commands['netstat']):
                    mg.update_machines({'ip':ip}, {'diagnose.error':'Provisioned But Network Failed'})
                else:
                    rootok,rootmsg = test_ssh(ip,2200,'root')
                    if not rootok:
                        finalmsg['root_ssh'] = rootmsg
                        mg.update_machines({'ip':ip}, {'diagnose.detail':make_error_msg(finalmsg)})
                        mg.update_machines({'ip':ip}, {'diagnose.error':'Root SSH Failed'})
                    else:
                        mg.update_machines({'ip':ip}, {'diagnose.error':'Success'})
        elif os == "windows":
            if not check_commands_done('ping_google',commands['ping_google']) or not check_commands_done('netstat',commands['netstat']):
                mg.update_machines({'ip':ip}, {'diagnose.error':'Provisioned But Network Failed'})
            else:
                mg.update_machines({'ip':ip}, {'diagnose.error':'Success'})
        else:
            mg.update_machines({'ip':ip}, {'diagnose.error':'Unkown OS'})
                

        # mg.update_machines({'ip':ip}, {'diagnose.error':'Success'})
        # msg = ""
        # ok = True
        # for key in commands.keys():
        #     if not check_commands_done(key,commands[key]):
        #         ok = False
        #         msg += key + " failed;"
        # if not ok:
        #     mg.update_machines({'ip':ip}, {'diagnose.error':msg})

    print("Diagnose End")
    return change_provision_status(ip, "Diagnosing", "Diagnosed")
    