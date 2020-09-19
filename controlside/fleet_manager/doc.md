# Fleet Manager

## api
The code of api calls

* machines.py
> API calls related to machines data.  
> * class MachineBase  
> Basic class of Views. Methods to get, update and clear machines. These methods are implemented in lib/machine_general.py.
> * class MachinesView  
> GET api/machines/hq/provider/: Get machines information. hq and provider in URL are specified filters. E.g. api/machines/all/all means get machines from all HQs and Providers.  
> POST api/machines/updatetype/: Update from HQs or Providers. The updatetype can be 'hq' or 'provider'. **This method is not used anymore**
> * class MachineView  
> GET api/machine/ip/: Get a single machine's data. A little bit more detailed in Diangose and Provision data compared with data got in MachinesView.

* status.py
> API calls related to update status and selections.
> * class StatusView  
> GET api/status/id/: Get update status. The id in URL can only be 'update_status'.  
> POST api/status/update/: Update from some sources. The sources are defined as the data of the request.
> * class EnvSelectView  
> GET api/envselect/: Get all the hq options, which is a list of HQs.
> * class ProviderSelectView  
> GET api/proselect/: Get all the provider options, which is a list of Providers.

* diagnose.py
> API calls related to the diagnose function.
> * class DiagnoseView  
> GET api/diagnose/ip/: Get the diagnose status and results of a machine.  
> Post api/diagnose/: Diagnose some machines. The list of machines are defined as the data of the request. The Diagnose process is implemented in lib/diagnose_flow.py

* migration.py
> API calls related to the migration function.
> * class MigrationBase  
> Basic class of Views. Methods to get, update and create migrations. These methods are implemented in lib/migration_general.py.
> * class MigrationsView  
> GET api/migrations/: Get all migrations information. Used for the migration table. **This method is not used anymore**  
> POST api/migrations/: Create a new migration request. List of machines and target HQ are defined as the data of the request. The API calls made to HQs are implemented in lib/hq_connector.py.
> * class MigrationView  
> GET api/migrate/id/: Get a single migration's data.  
> POST api/migrate/: Try to update a status of a migration in Fleet Manager. The id of the migration is defined as the data of the request. The update process is implemented in lib/migration_general.py.

* issues.py
> API calls related to the issue function.
> * class IssuesBase  
> Basic class of Views. Methods to get, update, create and close issues and relations. These methods are implemented in lib/issue_general.py.
> * class IssuesView  
> GET api/issues/: Get the list of all issues. Used for the issues table.  
> POST api/issues/: Create a new issue. 
> * class IssueView  
> GET api/issue/id/: Get a single issue's data.  
> POST api/issue/: Do some operations on an issue. The issue id and operation is defined as the data of the request. Operations are 'add_relation', 'add_new_chat' and 'close_issue'. They are implemented in lib/issue_general.py

* provision.py
> API calls related to the provision function.
> * class ProvisionView  
> GET api/provision/ip/: Get the provision output data of a machine.  
> POST api/provision/: Provision some machines. The list of IP and target environment are defined as the data of the request. The provision process is implemented in lib/provision_flow.py   

* datacenters.py
> API calls related to the datacenter table.
> * class DatacenterBase  
> Basic class of Views. Methods to get, update, and refresh datacenters. These methods are implemented in lib/datacenter_general.py.
> * class DatacentersView  
> GET api/datacenters/: Get the list of datacenters.  
> POST api/datacenters/: Refresh the datacenters data in DB.  

* tags.py
> API calls related to the tag edit function.
> * class TagsView  
> POST api/tags/ip/: Change the tags of a machine. The sync process with HQ is implemented in lib/hq_connector.py     

* login.py
> API calls related to the login function.  
> **NOT IMPLEMENTED YET**

* label.py
> API calls related to the label edit function.
> * class LabelView  
> POST api/label/ip/: Change the label of a machine. The sync process with HQ is implemented in lib/hq_connector.py     

* maintenance.py
> API calls related to the maintenance function.
> * class MaintenanceView  
> POST api/label/ip/: Change the maintenance state of a machine. The sync process with HQ is implemented in lib/hq_connector.py     

## lib
Implementation of api calls and internfaces.

* api_caller.py
> Internface to make REST api calls. Now used when call HQs or GameServers.  
> call: You can specifiy the url, header, method (GET/POST) and data. You can choose the use the cred files when call HQs.  

* datacenter_general.py
> Implementation of operations related to datacenter.  
> new_datacenter: Define the data structure of datacenter object.  
> change_name: A mapping process of datacenter names in doc to names in the system.  
> trans_dc_name: A mapping process of datacenter names from providers to names in the system.  
> match: Try to match a datacenter in the system with a name from providers. If no datacenter is matched, return 'unknown'  
> get_datacenter: Get datacenters from DB, with a possible filter.  
> update_datacenters: Update a datacenter in DB.  
> load_from_file: Load all datacenters' data from the file into the system.  
> refresh: Re-calculate the statics of datacenters, like the connected machines number.  
> clear_datacenters: Clear all datacenters data in DB.  
> add_issue_related: Relate a issue to a datacenter.  
> clear_issue_relation: Disconnect a issue with a datacenter.  

* datadef.py
> Interface to transform the data from DB to data needed in the frontend.  
> get_def: Get the data format defination.  
> get_data_value: Get specific data from a json object, with the key path and type.  
> transfer_type: Transform the data from type in the system to the type in the frontend.  
> form_data: Transform a json data object to the data needed in the frontend by the data format defination. 'transfer' type means transform key-value pairs into list; 'project' means transform key-value pairs into different key-value pairs.  

* db.py
> Interface to MongoDB.  

* diagnose_flow.py
> The diagnose process.
>