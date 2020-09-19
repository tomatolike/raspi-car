import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Col} from 'react-bootstrap'

class Status extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        {headerName:"Source", field: "source", sortable: true, filter: true, 
          checkboxSelection: function(params) {
            return params.columnApi.getRowGroupColumns().length === 0;
          },
          headerCheckboxSelection: function(params) {
            return params.columnApi.getRowGroupColumns().length === 0;
          },
          headerCheckboxSelectionFilteredOnly: true,
        },
        {headerName:"Type", field: "stype", sortable: true, filter: true, },
        {headerName:"Status", field: "status", sortable: true, filter: true, },
        {headerName:"Error", field: "error", sortable: true, filter: true, },
        {headerName:"Updated Machine Number", field: "number", sortable: true, filter: true, },
        {headerName:"Last Update Time", field:"timestamp", sortable:true, filter:true},
      ],
      rowData: [

      ],
      info:"",
      interval:null,
    }
    this.updateStatus = this.updateStatus.bind(this);
    
    this.updateHQMachines = this.updateHQMachines.bind(this);
    this.updateProMachines = this.updateProMachines.bind(this);
    this.update = this.update.bind(this);
    this.mytable = React.createRef()
  }

  update(){
    var selecteddata = this.mytable.current.gridApi.getSelectedRows()
    var data = []

    var i;
    for (i=0; i<selecteddata.length; i++){
      data.push(
        {
          'source':selecteddata[i].source,
          'type':selecteddata[i].stype
        }
      )
    }

    let mycomp = this
    
    const endpoint = '../api/status/update/'
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.updateStatus()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateStatus(){
    if (this.state.status === ""){
      return null
    }
    
    let mycomp = this

    let endpoint = '../api/status/update_status/'
    apicallget(endpoint).then(
      function(responseData){
        //   console.log(responseData)
        mycomp.setState({rowData:responseData.data})
        }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateHQMachines(){
    // console.log("Update HQ Machines")

    const endpoint = '../api/machines/hq/'

    let data = {}

    let mycomp = this
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.updateStatus()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateProMachines(){
    // console.log("Update Pro Machines")

    const endpoint = '../api/machines/provider/'

    let data = {}

    let mycomp = this
    
    apicallpost(endpoint,data).then(
      function(responseData){
        // console.log(responseData)
        mycomp.updateStatus()
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  componentDidMount(){
    this.updateStatus();

    var _interval = setInterval(this.updateStatus, 10000);
    this.setState({interval:_interval})
  }

  componentWillUnmount(){
    clearInterval(this.state.interval)
  }

  render() {
    let header = (
      <div>
          {/* <Button variant="dark"  onClick={this.updateHQMachines}>
              update Machines from HQs
          </Button>
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.updateProMachines}>
              update Machines from Providers
          </Button> */}
          <Button variant="dark" style={{marginLeft: '10px'}} onClick={this.update}>
              update
          </Button>
        </div>
    )
    return (
      <Col style={{flexGrow:1}}>
        <MyTable ref={this.mytable} columnDefs={this.state.columnDefs} rowData={this.state.rowData} pagination={false}
        headerhight="5%"
        tablehight="95%"
        header={header}
        rowStyle={
          function(params){
            if(params.data.status === "Failed"){
              return {backgroundColor:"#ffd6d6"}
            }else if(params.data.status === "Updating"){
              return {backgroundColor:"#f9ffb3"}
            }
          }
        }
        />
      </Col>
    );
  }
}

export default Status;
