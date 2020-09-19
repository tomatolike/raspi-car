import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import apicallget from '../component/GET'

import {Col} from 'react-bootstrap'

class Migrations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        {headerName:"ID", field: "id", sortable: true, filter: true,
        cellRenderer: function(params) {
            return '<a href="/migrate/'+params.data.id+'">'+ params.data.id+'</a>'
          },
        },
        {headerName:"Aimed Enviroment", field: "aim_env", sortable: true, filter: true},
        {headerName:"Time", field: "time", sortable: true, filter: true},
        {headerName:"Finished", field:"finished", sortable: true, filter: true},
        {headerName:"Number of Machines", field:"number", sortable: true, filter: true}
      ],
      rowData:[
        // {"id":"123","aim_env":"test","time":"test","finished":"test","number":"test"}
      ],
      info:"",
      interval:null
    }
    this.loadMigrations = this.loadMigrations.bind(this)
  }

  loadMigrations(){
    // console.log("Load Machines")
    const endpoint = '../api/migrations/'

    let mycomp = this

    apicallget(endpoint).then(
      function(responseData){
        // console.log(responseData.response)
        mycomp.setState({rowData:responseData.response})
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  componentDidMount(){
      this.loadMigrations()

      var _interval = setInterval(this.loadMigrations, 60000);
      this.setState({interval:_interval})
  }

  componentWillUnmount(){
    clearInterval(this.state.interval)
  }

  render() {

    return (
      <Col style={{flexGrow:1}}>
        <MyTable columnDefs={this.state.columnDefs} rowData={this.state.rowData} pagination={true} 
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

export default Migrations;
