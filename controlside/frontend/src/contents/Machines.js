import React, { Component } from 'react';
import 'whatwg-fetch';
import MyTable from '../component/MyTable'
import {Button, OverlayTrigger, Tooltip, Dropdown} from 'react-bootstrap'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'
import {Pencil,CloudDownload,ClipboardCheck} from 'react-bootstrap-icons'
import copy from 'copy-to-clipboard'

import {Col,Modal,Spinner, DropdownButton, FormControl, InputGroup, Form} from 'react-bootstrap'
import Select from 'react-select'

class Machines extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        {
          headerName:"",
          headerGroupComponent: 'costomHeader',
          headerGroupComponentParams: {
            content:(
              <div>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="button-tooltip-2">Copy IPs to clipboard</Tooltip>}
              >
                <Button as="div" onClick={this.copyIPs.bind(this)} style={{backgroundColor:"transparent",borderColor:"transparent"}}><Pencil color="black" /></Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="button-tooltip-2">Download the table as CSV</Tooltip>}
              >
                <Button as="div" onClick={this.downloadCSV.bind(this)} style={{backgroundColor:"transparent",borderColor:"transparent"}}><CloudDownload color="black" /></Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="button-tooltip-2">Select machines from string</Tooltip>}
              >
                <Button as="div" onClick={this.handleSelectipstringmodal.bind(this)} style={{backgroundColor:"transparent",borderColor:"transparent"}}><ClipboardCheck color="black" /></Button>
              </OverlayTrigger>
              </div>
              // <Button as="div" onClick={this.copyIPs.bind(this)} style={{backgroundColor:"transparent",borderColor:"transparent"}}><Pencil color="black" /></Button>
            )
          },
          children:[
            {headerName:"IP", field: "ip", sortable: true, filter: true,
              checkboxSelection: function(params) {
                return params.columnApi.getRowGroupColumns().length === 0;
              },
              headerCheckboxSelection: function(params) {
                return params.columnApi.getRowGroupColumns().length === 0;
              },
              headerCheckboxSelectionFilteredOnly: true,
              cellRenderer: function(params) {
                // return '<a href="https://'+params.data.last_env+'-hq.tp.demonware.net/machine_details/'+params.data.ip+'">'+ params.data.ip+'</a>'
                return '<a href="/machine/'+params.data.ip+'">'+ params.data.ip+'</a>'
              },
            },
          ]
        },
        {
          headerName:"Provider Info",
          children: [
            {headerName:"Provider", field: "provider", sortable: true, filter: true},
            {headerName:"Contract ID", field: "contract_id", sortable: true, filter: true, columnGroupShow: 'open'},
            {
              headerName:"Contract Expiration Date", 
              field: "contract_expiration", 
              sortable: true, 
              filter: true,
              columnGroupShow: 'open'
            },
            {headerName:"Datacenter", field: "datacenter", sortable: true, filter: true,
            cellRenderer: 'myLinkRenderer',
            cellRendererParams: params => ({to:'/datacenters/', content:params.data.datacenter, history:this.props.history, params: {filtermode:{name:{filter:params.data.datacenter,filterType:"text",type:"contains"}}}}),
            },
            // {headerName:"Provider Tags", field: "info", sortable: true, filter: true, columnGroupShow: 'open'},
            {headerName:"OS", field: "os", sortable: true, filter: true, columnGroupShow: 'open'},
          ]
        },
        {
          headerName:"Thunderpants Info",
          children: [
            {headerName:"Last Env", field: "last_env", sortable: true, filter: true,
              cellRenderer: function(params){
                if(params.data.connected){
                  return '<a href="https://'+params.data.last_env+'-hq.tp.demonware.net">'+ params.data.last_env+'</a>'
                }else{
                  return '<p style="color:red;">'+params.data.last_env+" (unconnected)"+'</p>'
                }
              }
            },
            // {headerName:"Last Update", field: "last_state_update", sortable: true, filter: true, columnGroupShow: 'open'},
            {headerName:"Machine Type", field: "machine_type", sortable: true, filter: true, columnGroupShow: 'open'},
            {headerName:"Maintenance", field: "maintenance", sortable: true, filter: true,
            cellRenderer: 'maintenanceRenderer',
            cellRendererParams: params => ({params: params.data, callback: this.loadMachines}),
            },
            {headerName:"Label", field: "label", sortable: true, filter: true, columnGroupShow: 'open',
            cellRenderer: 'labelRenderer',
            cellRendererParams: params => ({params: params.data, callback: this.loadMachines}),
            },
            {headerName:"Tags", field: "tags", sortable: true, filter: true, columnGroupShow: 'open',
            cellRenderer: 'tagRenderer',
            cellRendererParams: params => ({ params: params.data, callback: this.loadMachines}),
            },
          ]
        },
        {
          headerName:"Fleet Manager",
          children: [
            {headerName:"Diagnose", field: "pro_error", sortable: true, filter: true,

              cellRenderer: 'diagnoseRenderer',
              cellRendererParams: params => ({ params: params.data}),
            },
            {headerName:"Provision", field: "provision_status", sortable: true, filter: true,

              cellRenderer: 'provisionRenderer',
              cellRendererParams: params => ({ params: params.data}),
            },
            {headerName:"Migrate", field: "migration_status", sortable: true, filter: true,

              cellRenderer: 'migrateRenderer',
              cellRendererParams: params => ({ params: params.data}),
            },
            {headerName:"Issue", field: "issues_count", sortable: true,
              filter: 'agNumberColumnFilter',
              cellRenderer: 'issueRenderer',
              cellRendererParams: params => ({ params: params.data}),
            }
          ]
        },
      ],
      datamap: {},
      rowData: [
        // {"ip": "255.255.255.255", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": "maintenance", "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Diagnosing test\ntest2", "provision_status": "Provisioning", "provision_brief": "lakdflkasdlkfasldkflaksdjflaksdjflkaksdjf", "migration_status":"Migrating", "migration_aimed":"s2prod", "issues_count":2, "issues_list":[{'issue_id':'a','issue_topic':'test'},{'issue_id':'b','issue_topic':'test2'}]},
        //   {"ip": "2", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": false, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": "maintenance", "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Success", "provision_status": "Failed", "provision_brief": "the failed message", "migration_status":"Migrated", "migration_aimed":"iw8prod", "issues_count":0, "issues_list":[]},
        //   {"ip": "3", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Ping Failed", "provision_status": "Done", "provision_brief": "The Done Message", "migration_status":null, "migration_aimed":null, "issues_count":1, "issues_list":[{'issue_id':'c','issue_topic':'test3'}]},
        //   {"ip": "4", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": null, "pro_error": null, "provision_status": null, "provision_brief": null, "migration_status":null, "migration_aimed":null, "issues_count":null, "issues_list":[]},
      ],
      info:"",
      interval:null,
      filter_provider:"all",
      filter_hq:"all",
      option_hqs:[],
      selected_hq:null,
      option_providers:[],
      quick_filter:null,
      spinner:false,
      error:"",
      typing: false,
      typingTimeout: 0,
      provisionmodal:false,
      migratemodal:false,
      selectipstringmodal:false,
      selectipstring:"",
      loaded:false,
      //filter set below
      filter_set:{
        unconnected:{
          status:false,
          call_back:function(node){
            if(node.data.connected === false || node.data.connected === null ){
              return true;
            }
          }
        },
        selected:{
          status:false,
          call_back:function(node){
            return node.isSelected();
          }
        },
      }
      //filter set above
    };
    this.mytable = React.createRef()
    this.loadMachines = this.loadMachines.bind(this);
    this.diagnoseMachines = this.diagnoseMachines.bind(this);
    this.migrateMachines = this.migrateMachines.bind(this);
    this.provisionMachines = this.provisionMachines.bind(this);
    this.getHQSelectOptions = this.getHQSelectOptions.bind(this);
    this.getProviderSelectOptions = this.getProviderSelectOptions.bind(this);
    this.handleMigratemodal = this.handleMigratemodal.bind(this);
    this.handleProvisionmodal = this.handleProvisionmodal.bind(this);
    this.handleSelectipstringmodal = this.handleSelectipstringmodal.bind(this);
    this.selectipstring = this.selectipstring.bind(this)
    this.handleQuickFilterChange = this.handleQuickFilterChange.bind(this);
    this.changtest = this.changtest.bind(this);
    this.changtest2 = this.changtest2.bind(this);
    this.handleMaintenance = this.handleMaintenance.bind(this);
    // this.copyIPs = this.copyIPs.bind(this);
  }

  copyIPs(){
    // console.log("copied")
    // copy("LIKE TEST")
    var _data = this.mytable.current.gridApi.getModel().rowsToDisplay
    // console.log(_data)
    var str = ""
    var i;
    for(i=0;i<_data.length;i++){
        str += _data[i].data['ip'] + ","
    }
    // console.log("copied:"+str)
    copy(str)
  }

  downloadCSV(){
    var params = {
      suppressQuotes: false,
      columnSeparator: ',',
    }

    this.mytable.current.gridApi.exportDataAsCsv(params);
  }

  getHQSelectOptions(){
    const endpoint = '../api/envselect/'
    let mycomp = this
    apicallget(endpoint).then(
      function(responseData){
        mycomp.setState(
          {
            option_hqs:responseData.data
          }
        )
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  getProviderSelectOptions(){
    const endpoint = '../api/proselect/'
    let mycomp = this
    apicallget(endpoint).then(
      function(responseData){
        mycomp.setState(
          {
            option_providers:responseData.data
          }
        )
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  loadMachines(){
    // console.log("Load Machines")
    this.setState({spinner:true,error:""})
    const endpoint = '../api/machines/all/all/'

    let mycomp = this

    apicallget(endpoint).then(
      function(response){
        // console.log("Mahcine Data Recieved")
        
        var _datamap = {}
        var i;
        var _add = []
        var _update = []
        var _remove = []
        for(i=0;i<response.response.length;i++){
          _datamap[response.response[i].ip] = true
          if(!(response.response[i].ip in mycomp.state.datamap)){
            _add.push(response.response[i]);
          }else{
            _update.push(response.response[i])
          }
        }
        for(i=0;i<mycomp.state.rowData.length;i++){
          if(!(mycomp.state.rowData[i].ip in _datamap)){
            _remove.push(mycomp.state.rowData[i])
          }
        }
        mycomp.mytable.current.gridApi.applyTransaction({update:_update,remove:_remove,add:_add})
        mycomp.setState({rowData:response.response, datamap:_datamap, spinner:false})
        
      }
    ).catch(
      function(_error){
        console.log("error", _error)
        mycomp.setState({spinner:false,error:"Network Failed"})
      }
    )
    // this.getHQSelectOptions()
    // this.getProviderSelectOptions()
    
  }

  diagnoseMachines(){
    var selecteddata = this.mytable.current.gridApi.getSelectedRows()
    var data = []

    var i;
    for (i=0; i<selecteddata.length; i++){
      data.push(selecteddata[i].ip)
    }

    let mycomp = this
    
    const endpoint = '../api/diagnose/'
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.loadMachines()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  migrateMachines(){
    if(this.state.selected_hq !== null){
      var _data = this.mytable.current.gridApi.getSelectedRows()
      var ips = []
      var i;
      for(i=0;i<_data.length;i++){
          ips.push({ip:_data[i]['ip'],last_env:_data[i]['last_env']})
      }

      var data = {
          machines:ips,
          aimedenv:this.state.selected_hq,
      }
      const endpoint = '../api/migrations/'
      var mycomp = this;

      apicallpost(endpoint,data).then(
        function(responseData){
          if(responseData.success === true){
            mycomp.loadMachines()
          }
      }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
    }
    this.handleMigratemodal()
  }

  handleMigratemodal(){
    if(this.state.migratemodal){
      this.setState({migratemodal:false})
    }else{
      this.setState({migratemodal:true})
    }
  }

  provisionMachines(){
    if(this.state.selected_hq !== null){
      var _data = this.mytable.current.gridApi.getSelectedRows()
      var _ips = []
      var i;
      for(i=0;i<_data.length;i++){
          _ips.push(_data[i]['ip'])
      }

      var data = {
          ips:_ips,
          aimedenv:this.state.selected_hq,
      }
      const endpoint = '../api/provision/'
      var mycomp = this;
      apicallpost(endpoint,data).then(
        function(responseData){
          if(responseData.success === true){
            mycomp.loadMachines()
          }
      }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
    }
    this.handleProvisionmodal()
  }

  handleMaintenance(){
    var select_data = this.mytable.current.gridApi.getSelectedRows()
    var data = {}
    var i;
    var count = 0;
    var final = true;
    for(i=0;i<select_data.length;i++){
        data[select_data[i]['ip']] = (select_data[i]['maintenance'] === "maintenance" ? true : false);
        if(data[select_data[i]['ip']]){
          count++;
        }
    }
    console.log(select_data.length,count)

    if(count >= select_data.length/2 && count < select_data.length){
      console.log("close to true")
      final = true;
    }
    if(count === select_data.length){
      console.log("all true to false")
      final = false;
    }
    if(count === 0){
      console.log("all false to true")
      final = true;
    }
    if(count < select_data.length/2 && count > 0){
      console.log("close to false")
      final = false;
    }

    for(i=0;i<select_data.length;i++){
      data[select_data[i]['ip']] = final
    }

    const endpoint = '../api/maintenance/'
    var mycomp = this;
    apicallpost(endpoint,data).then(
      function(responseData){
        if(responseData.success === true){
          mycomp.loadMachines()
        }
    }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  handleProvisionmodal(){
    if(this.state.provisionmodal){
      this.setState({provisionmodal:false})
    }else{
      this.setState({provisionmodal:true})
    }
  }

  handleSelectipstringmodal(){
    if(this.state.selectipstringmodal){
      this.setState({selectipstringmodal:false})
    }else{
      this.setState({selectipstringmodal:true})
    }
  }

  handleSelectipstringChange(event){
    // console.log(event.target.value)
    this.setState({selectipstring:event.target.value})
  }

  selectipstring(){
    var string = this.state.selectipstring;
    var i=0;
    var start=false;
    var stage=0;
    var num=[0,0,0,0];
    var ips = {}
    var count = 0
    for(i=0;i<string.length;i++){
      if(string[i]<='9' && string[i]>='0'){
        if(start==false){
          stage = 0;
          num[stage] = 0;
          num[stage] = string[i]-'0' + num[stage]*10;
          start = true;
        }else{
          num[stage] = string[i]-'0' + num[stage]*10;
          if(num[stage] > 255){
            start = false;
            continue;
          }
        }
      }else if(string[i] == '.'){
        if(start == true){
          stage++;
          if(stage > 3){
            start = false;
            continue;
          }else{
            num[stage] = 0;
          }
        }
      }else{
        if(start == true && stage == 3){
          // ips.push(num[0].toString()+'.'+num[1].toString()+'.'+num[2].toString()+'.'+num[3].toString())
          ips[num[0].toString()+'.'+num[1].toString()+'.'+num[2].toString()+'.'+num[3].toString()] = true
          count++;
          start = false;
        }else{
          start = false;
        }
      }
    }
    if(start == true && stage == 3){
      // ips.push(num[0].toString()+'.'+num[1].toString()+'.'+num[2].toString()+'.'+num[3].toString())
      ips[num[0].toString()+'.'+num[1].toString()+'.'+num[2].toString()+'.'+num[3].toString()] = true
      count++;
      start = false;
    }

    // console.log(ips);

    if(count > 0){
      this.mytable.current.gridApi.forEachNode(function(node) {
        // console.log(node.data.ip)
        // console.log(node)
        if(ips[node.data.ip] == true){
          // console.log("select")
          node.setSelected(true);
        }
      });
  
      var x = this.state.filter_set
      x['selected']['status'] = true;
      this.setState({filter_set:x})
      this.mytable.current.gridApi.onFilterChanged();
    }

    this.handleSelectipstringmodal();
  }

  componentDidMount(){
    this.loadMachines()
    this.getHQSelectOptions()
    this.getProviderSelectOptions()

    var _interval = setInterval(this.loadMachines, 30000);
    this.setState({interval:_interval})
  }

  componentWillUnmount(){
    clearInterval(this.state.interval)
  }

  handleQuickSearchChange(event){

    const mycomp = this;

    if (mycomp.state.typingTimeout){
      clearTimeout(mycomp.state.typingTimeout)
    }

    mycomp.setState(
      {
        quick_filter:event.target.value,
        typing: false,
        typingTimeout: setTimeout(
          function(){
            // console.log("Triggered")
            // console.log(mycomp.state)
            mycomp.mytable.current.gridApi.setQuickFilter(mycomp.state.quick_filter)
          }, 1000)
      }
    )
  }

  handleSelectChange(event){
    this.setState({selected_hq:event.value})
  }

  handleQuickFilterChange(event){
    // console.log("checked",event.target.id)
    var x = this.state.filter_set
    x[event.target.id]['status'] = (!x[event.target.id]['status'])
    this.setState({filter_set:x})
    this.mytable.current.gridApi.onFilterChanged();
  }

  changtest(){
    this.setState(
      {
        rowData:[
          {"ip": "255.255.255.255", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Diagnosing test\ntest2", "provision_status": "Provisioning", "provision_brief": "lakdflkasdlkfasldkflaksdjflaksdjflkaksdjf", "migration_status":"Migrating", "migration_aimed":"s2prod", "issues_count":2, "issues_list":[{'issue_id':'a','issue_topic':'test'},{'issue_id':'b','issue_topic':'test2'}]},
          {"ip": "2", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": false, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Success", "provision_status": "Failed", "provision_brief": "the failed message", "migration_status":"Migrated", "migration_aimed":"iw8prod", "issues_count":0, "issues_list":[]},
          {"ip": "3", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Ping Failed", "provision_status": "Done", "provision_brief": "The Done Message", "migration_status":null, "migration_aimed":null, "issues_count":1, "issues_list":[{'issue_id':'c','issue_topic':'test3'}]},
          {"ip": "4", "provider": "GameServers", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": null, "pro_error": null, "provision_status": null, "provision_brief": null, "migration_status":null, "migration_aimed":null, "issues_count":null, "issues_list":[]},
        ]
      }
    )
  }
  changtest2(){
    this.setState(
      {
        rowData:[
          {"ip": "255.255.255.255", "provider": "Multiplay", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": false, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosing", "pro_error": "Diagnosing test\ntest2", "provision_status": "Provisioning", "provision_brief": "lakdflkasdlkfasldkflaksdjflaksdjflkaksdjf", "migration_status":"Migrating", "migration_aimed":"s2prod", "issues_count":2, "issues_list":[{'issue_id':'a','issue_topic':'test'},{'issue_id':'b','issue_topic':'test2'}]},
        {"ip": "2", "provider": "Multiplay", "contract_id": "iw7", "contract_expiration": null, "datacenter": "test", "os": null, "info": null, "last_env": "beenoxcloud", "connected": false, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Success", "provision_status": "Failed", "provision_brief": "the failed message", "migration_status":"Migrated", "migration_aimed":"iw8prod", "issues_count":0, "issues_list":[]},
        {"ip": "3", "provider": "Multiplay", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": false, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": "Diagnosed", "pro_error": "Ping Failed", "provision_status": "Done", "provision_brief": "The Done Message", "migration_status":null, "migration_aimed":null, "issues_count":1, "issues_list":[{'issue_id':'c','issue_topic':'test3'}]},
        {"ip": "4", "provider": "Multiplay", "contract_id": "iw7", "contract_expiration": null, "datacenter": "gs-chicago", "os": null, "info": null, "last_env": "beenoxcloud", "connected": true, "last_state_update": "20/07/08 00:39:57", "machine_type": "gs-e5-2640-v4-2.4ghz-(40/256)", "maintenance": null, "label": null, "tags": null, "pro_status": null, "pro_error": null, "provision_status": null, "provision_brief": null, "migration_status":null, "migration_aimed":null, "issues_count":null, "issues_list":[]},
        ]
      }
    )
  }

  render() {

    var _options = this.state.option_hqs
    _options.concat(this.state.option_providers)

    var spinner;
    if(this.state.spinner){
      spinner = (
        <div style={{marginLeft:"auto"}}>
          <Spinner animation="border" variant="warning" size="sm" />
        </div>
      )
    }else{
      spinner = (
        <div style={{marginLeft:"auto"}}>
          <p style={{color:"red"}}>{this.state.error}</p>
        </div>
      )
    }

    var _header = (
      <div style={{display: "flex", flexDirection: "row", width:"100%"}}>
          <div style={{width:"400px"}}>
            <InputGroup>
              <FormControl
                placeholder="Quick Search"
                onChange={this.handleQuickSearchChange.bind(this)}
              />

              <DropdownButton
                as={InputGroup.Append}
                variant="dark"
                title="Quick Filter"
                id="input-group-dropdown-2"
              >
                <Form.Check id="unconnected" onClick={this.handleQuickFilterChange} label="Unconnected" />
                <Form.Check id="selected" checked={this.state.filter_set.selected.status} onClick={this.handleQuickFilterChange} label="Selected" />
              </DropdownButton>
            </InputGroup>
          </div>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.diagnoseMachines}>Diagnose</Button>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.handleMigratemodal}>Migrate</Button>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.handleProvisionmodal}>Provision</Button>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.handleMaintenance}>Maintenance</Button>
          {/* <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.changtest}>Change</Button>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.changtest2}>Change2</Button> */}
          {spinner}
        </div>
    )

    var filter
    if(this.props.location.state != null && this.props.location.state.params != null && this.props.location.state.params.filtermode != null){
      filter = this.props.location.state.params.filtermode
    }else{
      filter = null
    }
    // console.log("filter",filter)

    //external filter

    return (
      <Col style={{flexGrow:1}}>
          <MyTable ref={this.mytable} columnDefs={this.state.columnDefs} rowData={this.state.rowData} pagination={true}
          header={_header}
          headerhight="5%"
          tablehight="95%"
          defaultfilter={filter}
          floatfilter={true}
          ifexternalfilter={true}
          filter_set={this.state.filter_set}
          stedy={true}
          setid={true}
          getid={
            function(data){
              return data.ip
            }
          }
          rowStyle={
            function(params){
              if((params.data.pro_status === "Diagnosed" && params.data.pro_error !== "Success") || (params.data.connected === false || params.data.connected === null) || params.data.provision_status === "Failed"
              || params.data.migration_status === "Failed" || (params.data.datacenter !== null && params.data.datacenter.includes('unknown')) || params.data.issues_count > 0){
                return {backgroundColor:"#ffd6d6"}
              }
            }
          }
          sortitems={
            [
                {colId: 'ip', sort: 'desc'}
            ]
          }
          />
          <Modal show={this.state.migratemodal} onHide={this.handleMigratemodal}>
            <Modal.Header closeButton>
              <Modal.Title>Migrate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Target Environment:
              <Select options={this.state.option_hqs} onChange={this.handleSelectChange.bind(this)}/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.migrateMachines}>
                Migrate
              </Button>
              <Button variant="primary" onClick={this.handleMigratemodal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.provisionmodal} onHide={this.handleProvisionmodal}>
            <Modal.Header closeButton>
              <Modal.Title>Provision</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Target Environment:
              <Select options={this.state.option_hqs} onChange={this.handleSelectChange.bind(this)}/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.provisionMachines}>
                Provision
              </Button>
              <Button variant="primary" onClick={this.handleProvisionmodal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.selectipstringmodal} onHide={this.handleSelectipstringmodal}>
            <Modal.Header closeButton>
              <Modal.Title>Input</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <InputGroup>
                <FormControl
                  as="textarea"
                  onChange={this.handleSelectipstringChange.bind(this)}
                />
              </InputGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.selectipstring}>
                OK
              </Button>
              <Button variant="primary" onClick={this.handleSelectipstringmodal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          
      </Col>
    );
    
  }
}

export default Machines;
