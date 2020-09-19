import redis
from celery import Celery
import time
import lib.hq_connector as hq_connector
import lib.provider_connector as provider_connector
import lib.diagnose_flow as diagnose_flow
import lib.migration_general as mig
import lib.provision_flow as provision_flow
from datetime import timedelta

app = Celery('tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

## Usage
## celery -A lib.tasks worker -B -s ~/celerybeat-schedule

## Tasks Def

@app.task
def testtask():
    # time.sleep(5)
    print("hello keli")

@app.task
def provider_machines_update():
    return provider_connector.update_all_machines()

@app.task
def update_provider_machines(provider):
    return provider_connector.update_provider_machines(provider)

@app.task
def update_hq_machines(hq):
    return hq_connector.update_hq_machines(hq)

@app.task
def hq_machines_update():
    return hq_connector.update_all_machines(update_hq_machines)

@app.task
def diagnose(ip):
    return diagnose_flow.diagnose(ip)

@app.task
def migration_check():
    return mig.migration_check()

@app.task
def one_migration_check(_id):
    return mig.one_migration_check(_id)

@app.task
def provision_machine(ip, env):
    provision_flow.provision(ip, env)

## Schedule Part

schedule = {}

schedule[ "hq_machines_update_per_hour" ] = {
	"task": 		"lib.tasks.hq_machines_update",
	"schedule":		timedelta(seconds = 3600),
	"args": 		()
}

schedule[ "migration_check_per_5_minutes" ] = {
	"task": 		"lib.tasks.migration_check",
	"schedule":		timedelta(seconds = 60),
	"args": 		()
}

app.conf.beat_schedule = schedule
app.conf.timezone = 'UTC'
