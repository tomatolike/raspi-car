from django.contrib import admin
from django.urls import path,include

import api.machines
import api.status
import api.diagnose
import api.migration
import api.issues
import api.provision
import api.datacenters
import api.tags
import api.login
import api.label
import api.maintenance

urlpatterns = [
    path('machines/<hq>/<provider>/', api.machines.MachinesView.as_view()),
    path('machine/<ip>/', api.machines.MachineView.as_view()),
    path('machines/<updatetype>/', api.machines.MachinesView.as_view()),
    path('status/<status_id>/', api.status.StatusView.as_view()),
    path('status/update/', api.status.StatusView.as_view()),
    path('diagnose/<ip>/', api.diagnose.DiagnoseView.as_view()),
    path('diagnose/', api.diagnose.DiagnoseView.as_view()),
    path('migrate/', api.migration.MigrationView.as_view()),
    path('migrate/<id>/', api.migration.MigrationView.as_view()),
    path('migrations/', api.migration.MigrationsView.as_view()),
    path('issues/', api.issues.IssuesView.as_view()),
    path('issue/<id>/', api.issues.IssueView.as_view()),
    path('issue/', api.issues.IssueView.as_view()),
    path('provision/<ip>/', api.provision.ProvisionView.as_view()),
    path('provision/', api.provision.ProvisionView.as_view()),
    path('envselect/', api.status.EnvSelectView.as_view()),
    path('proselect/', api.status.ProviderSelectView.as_view()),
    path('datacenters/', api.datacenters.DatacentersView.as_view()),
    path('tags/<ip>/', api.tags.TagsView.as_view()),
    path('label/<ip>/', api.label.LabelView.as_view()),
    path('maintenance/',api.maintenance.MaintenanceView.as_view()),
    path('login/', api.login.LoginView.as_view())
]
