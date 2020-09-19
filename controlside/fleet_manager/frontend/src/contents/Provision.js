import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import Select from 'react-select'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Row, Col} from 'react-bootstrap'

class Provision extends Component {

  constructor(props) {
    super(props);
    this.state = {
        def:[
            {headerName:"IP", field: "ip", sortable: true, filter: true},
            {headerName:"Last Env", field: "last_env", sortable: true, filter: true},
        ],
        data:[],
        aimedenv:"",
        selectoptions:[
        ],
    }
    this.sendnewrequest = this.sendnewrequest.bind(this);
    this.backtomachines = this.backtomachines.bind(this);
    this.getSelectOptions = this.getSelectOptions.bind(this)
  }

  componentDidMount(){
    this.setState({data:this.props.location.state.data})
    this.getSelectOptions()
  }

  handleSelectChange(event){
    this.setState({aimedenv:event.value})
  }

  sendnewrequest(){
      // console.log("New Provision Request")

      var _ips = []
      var i;
      for(i=0;i<this.state.data.length;i++){
          _ips.push(this.state.data[i]['ip'])
      }

      var data = {
          ips:_ips,
          aimedenv:this.state.aimedenv,
      }

    // console.log(data)
    
    const endpoint = '../api/provision/'

    var mycomp = this;

    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        if(responseData.success === true){
            mycomp.backtomachines()
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

  render() {
    var button1, button2, input;
    var fisrtsection;
    input = (<Select options={this.state.selectoptions} onChange={this.handleSelectChange.bind(this)}/>)
    button1 = (<Button variant="dark" onClick={this.sendnewrequest}>OK</Button>)
    button2 = (<Button variant="dark" onClick={this.backtomachines}>Cancel</Button>)
    fisrtsection=(
        <Row style={{ width: '100%', height: '20%' }}>
          <Col >
            <h4>Aimed Enviroment</h4>
            <div style={{marginTop:"1vh",display: "inline-flex", flexDirection: "row"}}>
              <div style={{width:"200px"}}>{input}</div>
              {button1}
              {button2}
            </div>
          </Col>
        </Row>
    )
    return (
      <Col style={{flexGrow:1}}>
            {fisrtsection}
            <Row style={{ width: '100%', height: '80%' }}>
              <Col >
                <MyTable columnDefs={this.state.def} rowData={this.state.data} pagination={true} 
                header={
                  (
                    <h4>Machines To Provision</h4>
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

export default Provision;
