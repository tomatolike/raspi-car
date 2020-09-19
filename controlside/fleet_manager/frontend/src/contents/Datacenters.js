import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Col,Spinner,Button} from 'react-bootstrap'

class Datacenters extends Component {

  constructor(props) {
    super(props);
    this.state = {
        spinner:false,
        error:"",
      columnDefs: [
        {headerName:"Name", field: "name", sortable: true, filter: true,
        cellRenderer: 'myLinkRenderer',
        cellRendererParams: params => ({to:'/machines/', content:params.data.name, history:this.props.history, params: {filtermode:{datacenter:{filter:params.data.name,filterType:"text",type:"contains"}}}}),
        },
        {headerName:"DCID", field: "dcid", sortable: true, filter: true},
        {headerName:"Provider", field: "provider", sortable: true, filter: true},
        {headerName:"Total Machines", field: "all", sortable: true, filter: true},
        {headerName:"Connected", field:"connected", sortable: true, filter: true},
        {headerName:"Pre Provision", field:"pre_provision", sortable: true, filter: true},
        {headerName:"Issue Machines", field:"issue_machine", sortable: true, filter: true},
        {headerName:"Cores / E3", field:"cores", sortable: true, filter: true,
        cellRenderer: function(params) {
          return params.data.cores.toString() + " / " + (params.data.cores/8).toString()
        },
        },
        {headerName:"Issue", field: "issues_count", sortable: true, filter: true,

              cellRenderer: 'issueRenderer',
              cellRendererParams: params => ({ params: params.data}),
            }
      ],
      rowData:[
        // {"name": "blizzard-chicago", "dcid": 230, "provider": "Blizzard", "all": 59, "connected": 58, "pre_provision": 59, "issue_machine": 0, "issues_count": 0, "issues_list": [], "cores": 580}, {"name": "blizzard-paris", "dcid": 231, "provider": "Blizzard", "all": 92, "connected": 91, "pre_provision": 92, "issue_machine": 0, "issues_count": 0, "issues_list": [], "cores": 910}
      ],
      info:"",
    }
    this.loadDatacenters = this.loadDatacenters.bind(this)
    this.refresh = this.refresh.bind(this)
  }

  loadDatacenters(){
    // console.log("Load Machines")
    const endpoint = '../api/datacenters/'

    let mycomp = this

    apicallget(endpoint).then(
      function(responseData){
        // console.log(responseData.response)
        mycomp.setState({rowData:responseData.response, spinner:false})
      }
    ).catch(
      function(error){
        console.log("error", error)
        mycomp.setState({spinner:false,error:"Network Failed"})
      }
    )
  }

  refresh(){
    this.setState({spinner:true,error:""})
      const endpoint = '../api/datacenters/'

      let mycomp = this

      apicallpost(endpoint).then(
          function(responseData){
              mycomp.loadDatacenters()
          }
      ).catch(
          function(error){
              console.log("error", error)
              mycomp.setState({spinner:false,error:"Network Failed"})
          }
      )
  }

  componentDidMount(){
      this.loadDatacenters()
  }

  render() {

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

    var filter
    if(this.props.location.state != null && this.props.location.state.params != null && this.props.location.state.params.filtermode != null){
      filter = this.props.location.state.params.filtermode
    }else{
      filter = null
    }

    return (
      <Col style={{flexGrow:1}}>
        <MyTable columnDefs={this.state.columnDefs} rowData={this.state.rowData} pagination={true} 
        header={
            (
                <div style={{display: "inline-flex", flexDirection: "row", width:"100%"}}>
                    <Button variant="dark" style={{}} onClick={this.refresh}>
                        refresh
                    </Button>
                    {spinner}
                </div>
            )
        }
        headerhight="5%"
        tablehight="95%"
        rowStyle={
          function(params){
            if(params.data.issues_count > 0){
              return {backgroundColor:"#ffd6d6"}
            }
          }
        }
        defaultfilter={filter}
        sortitems={
                [
                    {colId: 'time', sort: 'desc'}
                ]
            }
        />
      </Col>
    );
    
  }
}

export default Datacenters;
