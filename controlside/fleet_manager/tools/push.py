import subprocess

subprocess.run("sudo python3 push_tunnel.py --env fleetmgr -t tp,restart",shell=True, cwd="/thunderpants/scripts/ansible/")
