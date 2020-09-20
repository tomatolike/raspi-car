import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import Select from 'react-select'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Row, Col} from 'react-bootstrap'

class Migrate extends Component {

  constructor(props) {
    super(props);
    // console.log("Migrate")
    // console.log(props)
    this.state = {
        info_def:[
            {headerName:"ID", field: "id", sortable: true, filter: true},
            {headerName:"Aimed Enviroment", field: "aim_env",},
            {headerName:"Time", field: "time"},
            {headerName:"Finished", field:"finished"}
        ],
        info_data:[],
        def:[
            {headerName:"IP", field: "ip", sortable: true, filter: true},
            {headerName:"From Env", field: "last_env", sortable: true, filter: true},
            {headerName:"To Env", field:"new_env", sortable: true, filter: true},
            {headerName:"Status", field:"status", sortable: true, filter: true}
        ],
        data:[],
        new:false,
        aimedenv:"",
        selectoptions:[
        ],
        done:false,
    }
    this.sendnewrequest = this.sendnewrequest.bind(this);
    this.backtomachines = this.backtomachines.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkfinished = this.checkfinished.bind(this);
    this.updatemigration = this.updatemigration.bind(this);
    this.getSelectOptions = this.getSelectOptions.bind(this)
  }

  componentDidMount(){
    if(this.props.match.params.id === "new"){
        this.setState({data:this.props.location.state.data, new:true})
        this.getSelectOptions()
    }else{
        this.updatemigration()
    }
  }

  handleSelectChange(event){
    this.setState({aimedenv:event.value})
  }

  updatemigration(){
      var id = this.props.match.params.id
      const endpoint = '../api/migrate/'+id;

    let mycomp = this

    apicallget(endpoint).then(
      function(responseData){
        // console.log(responseData)
        mycomp.setState({data:responseData.machines})
        mycomp.setState({info_data:[responseData], done:responseData.finished})
    }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  sendnewrequest(){
      // console.log("New Migrate Request")
      // console.log(this.state.data)
      // console.log(this.state.aimedenv)

      var ips = []
      var i;
      for(i=0;i<this.state.data.length;i++){
          ips.push({ip:this.state.data[i]['ip'],last_env:this.state.data[i]['last_env']})
      }

      var data = {
          machines:ips,
          aimedenv:this.state.aimedenv,
      }

    // console.log(data)
    
    const endpoint = '../api/migrations/'
    var mycomp = this;

    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        if(responseData.success === true){
            mycomp.props.history.push(
                {
                    pathname:"/machines/",
                }
            )
            // mycomp.setState({new:false})
            // mycomp.updatemigration()
        }
    }
    ).catch(
      function(error){
        console.log("error", error)
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

  backtomachines(){
    this.props.history.push({
        pathname:"/machines/",
      })
  }

  handleChange(event){
      this.setState({
          aimedenv:event.target.value
      })
  }

  checkfinished(){

    var data = [this.props.match.params.id]

    const endpoint = '../api/migrate/'
    let mycomp = this

    apicallpost(endpoint,data).then(
      function(responseData){
        mycomp.updatemigration()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  render() {
    var button1, button2;
    var fisrtsection;
    if(this.state.new){
        button1 = (<Button variant="dark" onClick={this.sendnewrequest}>OK</Button>)
        button2 = (<Button variant="dark" onClick={this.backtomachines}>Cancel</Button>)
        fisrtsection=(
              <Row style={{ width: '100%', height: '10%' }}>
                <Col >
                  
                    <h4>Aimed Enviroment</h4>
                    <div style={{marginTop:"1vh",display: "inline-flex", flexDirection: "row"}}>
                      <div style={{width:"200px"}}><Select options={this.state.selectoptions} onChange={this.handleSelectChange.bind(this)}/></div>
                      {button1}
                      {button2}
                    </div>
                  
                </Col>
              </Row>
        )
    }else{
        if(this.state.done){
          button1 = null;
          button2 = null;
        }else{
          button1 = (<Button variant="dark" onClick={this.checkfinished}>Status Check</Button>);
          button2 = (<Button variant="dark" onClick={this.updatemigration}>Refresh</Button>);
        }
        fisrtsection=(
          <Row style={{ width: '100%', height: '20%' }}>
            <Col>
              <MyTable columnDefs={this.state.info_def} rowData={this.state.info_data} pagination={false} 
              header={
                (
                  <div style={{display: "inline-flex", flexDirection: "row"}}>
                    {button1}
                    {button2}
                    <h4>Basic Info</h4>
                  </div>
                )
              }
              headerhight="20%"
              tablehight="80%"
              />
              </Col>
            </Row>
        )
    }
    return (
      <Col style={{flexGrow:1}}>
        {fisrtsection}
        <Row style={{ width: '100%', height: '80%' }}>
          <Col >
            <MyTable columnDefs={this.state.def} rowData={this.state.data} pagination={false}
            header={
              (
                <h4>Machines To Migrate</h4>
              )
            }
            headerhight="5%"
            tablehight="95%"
            />
          </Col>
        </Row>
      </Col>
    );
  }
}

export default Migrate;
