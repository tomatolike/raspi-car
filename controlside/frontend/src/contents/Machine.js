import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import Select from 'react-select'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Row, Col} from 'react-bootstrap'

class Machine extends Component {

  constructor(props) {
    super(props);
    this.state = {
        aimedenv:"",
        basic_info_def:[
            {headerName:"IP", field: "ip",
                cellRenderer: function(params) {
                  if(params.data.last_env !== null){
                    return '<a href="https://'+params.data.last_env+'-hq.tp.demonware.net/machine_details/'+params.data.ip+'">'+ params.data.ip+'</a>'
                  }else{
                    return params.data.ip
                  }
              },
            },
            {headerName:"Provider", field: "provider", sortable: true, filter: true},
            {headerName:"Contract ID", field: "contract_id", sortable: true, filter: true},
            {
              headerName:"Contract Expiration Date", 
              field: "contract_expiration", 
              sortable: true, 
              filter: true,
            },
            {headerName:"Datacenter", field: "datacenter", sortable: true, filter: true,
            cellRenderer: 'myLinkRenderer',
            cellRendererParams: params => ({to:'/datacenters/', content:params.data.datacenter, history:this.props.history, params: {filtermode:{name:{filter:params.data.datacenter,filterType:"text",type:"contains"}}}}),
            },
            {headerName:"Provider Tags", field: "info", sortable: true, filter: true},
            {headerName:"Last Env", field: "last_env", sortable: true, filter: true},
            {headerName:"Last Update", field: "last_state_update", sortable: true, filter: true},
            {headerName:"Machine Type", field: "machine_type", sortable: true, filter: true},
            {headerName:"OS", field: "os", sortable: true, filter: true},
            {headerName:"Label", field: "label", sortable: true, filter: true, columnGroupShow: 'open'},
            {headerName:"Tags", field: "tags", sortable: true, filter: true, columnGroupShow: 'open',
            cellRenderer: 'tagRenderer',
            cellRendererParams: params => ({ params: params.data, callback: this.getMachineData}),
            },
        ],
        basic_info_data: [],
        issues_def: [
            {headerName:"Topic", field: "topic", sortable: true, filter: true,
            cellRenderer: function(params) {
              return '<a href="/issue/'+params.data.id+'">'+ params.data.topic+'</a>'
            },
            },
            {headerName:"Last Updated", field:"last_update", sortable: true, filter: true},
            {headerName:"Status", field:"status", sortable: true, filter: true}
        ],
        issues_data:[],
        diagnose_status: null,
        provision_status: null,
        diagnose_def:[
            {headerName:"Test", field: "test"},
            {headerName:"Status", field: "status"},
        ],
        diagnose_data:[],
        provision_def:[
          {headerName:"Content", field: "content"},
        ],
        provision_data:[],
        ip:"",
        selectoptions:[
        ],
        interval:null,
        intervaltime:14,
    }
    this.setBasicData = this.setBasicData.bind(this);
    this.setProvisionData = this.setProvisionData.bind(this);
    this.getMachineData = this.getMachineData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOsChange = this.handleOsChange.bind(this);
    this.getSelectOptions = this.getSelectOptions.bind(this)
    this.Interval = this.Interval.bind(this)
    this.updateall = this.updateall.bind(this)
  }

  setBasicData(data){
    // console.log("set basic data",data);
      this.setState({basic_info_data:[data], provision_status:data.provision_status, diagnose_status:data.pro_status, issues_data:data.issues})
  }

  setProvisionData(responseData){
      // console.log(responseData)
      this.setState({diagnose_status:responseData.status,diagnose_data:responseData.data})
  }

  setProvisioningData(responseData){
    this.setState(
      {
        provision_data:responseData.result,
        provision_status:responseData.status
      }
    )
  }

  getSelectOptions(){
    const endpoint = '../api/envselect/'

    let mycomp = this

    apicallget(endpoint).then(
      function(responseData){
        // console.log(responseData)
        mycomp.setState(
          {
            selectoptions:responseData.data
          }
        )
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  handleSelectChange(event){
    this.setState({aimedenv:event.value})
  }

  getMachineData(){
    const endpoint = '../api/machine/'+this.state.ip+'/'
    let mycomp = this

    apicallget(endpoint).then(
      function(responseData){
        // console.log(responseData)
        mycomp.setBasicData(responseData.response)
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  testdiagnose(){
    // console.log(data)
    var data = [this.state.ip]
    const endpoint = '../api/diagnose/'
    let mycomp = this
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.updateDiagnoseStatus()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  provisioning(){
    var data = {
      'ips':[this.state.ip],
      'aimedenv':this.state.aimedenv,
    }
    const endpoint = '../api/provision/'
    let mycomp = this
    
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.updateprovision()
        mycomp.updateDiagnoseStatus()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateprovision(){
    let mycomp = this

    let endpoint = '../api/provision/'+this.state.ip+'/'
    apicallget(endpoint).then(
      function(responseData){
        //   console.log(responseData)
            mycomp.setProvisioningData(responseData)
        }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateDiagnoseStatus(){

    let mycomp = this

    let endpoint = '../api/diagnose/'+this.state.ip+'/'
    apicallget(endpoint).then(
      function(responseData){
        //   console.log(responseData)
            mycomp.setProvisionData(responseData)
        }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  handleChange(event){
    this.setState({
      aimedenv:event.target.value
  })
  }

  handleOsChange(event){
    this.setState({
      os:event.target.value
  })
  }

  Interval(){
    if(this.state.intervaltime === 0){
      this.setState({intervaltime:14})
      this.getMachineData()
      this.updateDiagnoseStatus();
      this.updateprovision();
    }else{
      var temp = this.state.intervaltime - 1
      this.setState({intervaltime:temp})
    }

    if(this.state.diagnose_status === "Diagnosing"){
      this.updateDiagnoseStatus();
    }

    if(this.state.provision_status === "Provisioning"){
      this.updateprovision();
    }
  }

  updateall(){
    let mycomp = this
    mycomp.getMachineData();
    mycomp.updateDiagnoseStatus();
    mycomp.updateprovision();
  }

  componentDidMount(){
    let _ip = this.props.match.params.ip
    let mycomp = this
    console.log(this.props)
    if (this.props.match){
      // console.log("try to load data")
        this.setState({ip:_ip}, ()=>{
            mycomp.getMachineData();
            mycomp.updateDiagnoseStatus();
            mycomp.updateprovision();
            mycomp.getSelectOptions();
        })
    }

    var _interval = setInterval(this.Interval, 5000);
    this.setState({interval:_interval})
  }

  componentWillUnmount(){
    clearInterval(this.state.interval)
  }

  render() {
    return (
      <Col style={{flexGrow:1, height:"200vh"}}>
        <Row style={{ width: '100%', height: '10%' }}>
          <Col>
          <MyTable columnDefs={this.state.basic_info_def} rowData={this.state.basic_info_data} rowResize={true} pagination={false}
          header={
            (
              <h4>Machine</h4>
            )
          }
          onreadycallback={this.updateall}
          headerhight="20%"
          tablehight="80%"
          notflex={true}
          />
          </Col>
        </Row>

        <Row style={{ width: '100%', height: '30%' }}>
        <Col>
          <MyTable columnDefs={this.state.diagnose_def} rowData={this.state.diagnose_data} keepbottom={true} pagination={false} 
          header={
            <div style={{marginTop:"1vh",display: "inline-flex", flexDirection: "row"}}>
              <Button variant="dark" onClick={this.testdiagnose.bind(this)}>
                  Diagnose
              </Button>
              <h4 style={{marginLeft:"1vw"}}>Diagnose Status: {this.state.diagnose_status}</h4>
            </div>
          }
          headerhight="10%"
          tablehight="90%"
          />
          </Col>
        </Row>

        <Row style={{ width: '100%', height: '35%' }}>
        <Col>
          <MyTable columnDefs={this.state.provision_def} rowData={this.state.provision_data} pagination={false} rowResize={true} keepbottom={true}
          header={
            (
              <div style={{marginTop:"1vh",display: "inline-flex", flexDirection: "row"}}>
                <div style={{width:"200px"}}><Select options={this.state.selectoptions} onChange={this.handleSelectChange.bind(this)}/></div>
                <Button variant="dark" onClick={this.provisioning.bind(this)}>
                    Provision
                </Button>
                <h4 style={{marginLeft:"1vw"}}>Provision Status: {this.state.provision_status}</h4>
              </div>
            )
          }
          headerhight="10%"
          tablehight="90%"
          />
          </Col>
        </Row>

        <Row style={{ width: '100%', height: '25%' }}>
        <Col>
          <MyTable columnDefs={this.state.issues_def} rowData={this.state.issues_data} pagination={true} 
          header={
            (
              <h4>Related Issues</h4>
            )
          }
          headerhight="10%"
          tablehight="90%"
          />
          </Col>
        </Row>
      </Col>
    );
  }
}

export default Machine;
