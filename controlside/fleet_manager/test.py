import subprocess
import select

def startprocess(ip, env, os):
    process = subprocess.Popen("python3 make_machine.py --env "+env+" --os "+os+" --provider bare --bare-ip "+ip+"", cwd="/thunderpants/scripts/provisioning/machine/", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return process

def readerror(process):
    errors = process.stderr.readlines()
    output = ""
    for error in errors:
        output += error.decode('utf-8')
    print(output)

def outputresult(process):
    poll_obj = select.poll()
    poll_obj.register(process.stdout, select.POLLIN)
    while True:
        poll_res = poll_obj.poll(0)
        if poll_res:
            output = process.stdout.readline()
            print(output.strip().decode('utf-8'))
            if process.poll() != None:
                break
        else:
            break
    print(process.poll())

