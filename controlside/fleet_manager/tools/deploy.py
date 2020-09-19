import dbinitial
import google_api_auth
import sys
import subprocess
from optparse import OptionParser
# Deploy the Fleet Manager !!
parser = OptionParser()
parser.add_option("-d", "--databaseskip", action="store_true", dest="skip_database_inital", default=False, help="Skip initialization of the database")
parser.add_option("-b", "--beat", action="store_true", dest="celery_beat", default=False, help="Enable the beat schedule of celery")
parser.add_option("-i", "--ip", dest="django_ip", default='0.0.0.0', help="The IP of django server. Default 0.0.0.0")
parser.add_option("-p", "--port", dest="django_port", default='8080', help="The Port of django server. Default 8080")
(options, args) = parser.parse_args()

# First you need to inital the DB
if not options.skip_database_inital:
    if dbinitial.initial():
        print("DB Initial Failed")
    else:
        print("DB Initialed")

# Now, we really need to do a google API test
if google_api_auth.authorize():
    print("Goole API Token Got")
else:
    print("Failed to get Google API Token")

# Then, lunch the Celery!
print("Starting Celery!")
command = 'celery -A lib.tasks worker'
if options.celery_beat:
    command += ' -B -s ~/celerybeat-schedule'
celery = subprocess.Popen(command, cwd='/thunderpants/fleet_manager', shell=True)

# Finally, lunch the fleet manager!
print("Starting Fleet Manager!")
ip = options.django_ip
port = options.django_port
fleet_manager = subprocess.Popen('python3 manage.py runserver '+ip+':'+str(port), cwd='/thunderpants/fleet_manager', shell=True)

try:
    print("Keep Waiting")
    fleet_manager.wait()
except:
    print("Kill Celery!")
    celery.kill()
    print("Kill Fleet Manager")
    fleet_manager.kill()

print("End")