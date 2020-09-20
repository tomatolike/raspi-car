import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import {Col,Modal} from 'react-bootstrap'

class Issues extends Component {

    constructor(props) {
        super(props);
        this.state = {
          columnDefs: [
            {headerName:"Topic", field: "topic", sortable: true, filter: true,
                cellRenderer: function(params) {
                return '<a href="/issue/'+params.data.id+'">'+ params.data.topic+'</a>'
              },
            },
            {headerName:"Start Time", field: "start_time", sortable: true, filter: true},
            {headerName:"Last Updated", field:"last_update", sortable: true, filter: true},
            {headerName:"Related", field:"related", sortable: true, filter: true},
            {headerName:"Status", field:"status", sortable: true, filter: true}
          ],
          rowData:[],
          info:"",
          interval:null,
          newmodal:false,
          newtopic:"",
        }
        this.loadIssues = this.loadIssues.bind(this)
        this.newIssue = this.newIssue.bind(this)
        this.handleNewmodal = this.handleNewmodal.bind(this)
        this.handlenewtopicChange = this.handlenewtopicChange.bind(this)
        this.createissue = this.createissue.bind(this)
      }

      handleNewmodal(){
        if(this.state.newmodal){
          this.setState({newmodal:false})
        }else{
          this.setState({newmodal:true})
        }
      }

      handlenewtopicChange(event){
        this.setState({
          newtopic:event.target.value
        })
      }

      createissue(){
        const endpoint = '../api/issues/'
    
        var data = {
            'topic':this.state.newtopic
        }
        let mycomp = this
    
        apicallpost(endpoint,data).then(
            function(responseData){
                if(responseData.success === true){
                    mycomp.props.history.push(
                        {
                            pathname:"/issue/"+responseData.id,
                        }
                    )
                }
            }
          ).catch(
            function(error){
              console.log("error", error)
            }
          )
      }
    
      loadIssues(){
        // console.log("Load Machines")
        const endpoint = '../api/issues/'
    
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

      newIssue(){
        this.props.history.push({
            pathname:"/issue/new",
          })
      }
    
      componentDidMount(){
          this.loadIssues()

          var _interval = setInterval(this.loadIssues, 60000);
          this.setState({interval:_interval})
      }

      componentWillUnmount(){
        clearInterval(this.state.interval)
      }
    
      render() {

        let _header = (
          <div>
              <Button variant="dark" style={{borderColor:"transparent"}} onClick={this.handleNewmodal}>
                new
              </Button>
            </div>
        )
    
        return (
          <Col style={{flexGrow:1}}>
            <MyTable columnDefs={this.state.columnDefs} rowData={this.state.rowData} pagination={true} 
            header={_header}
            headerhight="5%"
            tablehight="95%"
            rowStyle={
              function(params){
                if(params.data.status === "open"){
                  return {backgroundColor:"#ffd6d6"}
                }
              }
            }
            sortitems={
                [
                    {colId: 'last_update', sort: 'desc'}
                ]
            }
            />
            <Modal show={this.state.newmodal} onHide={this.handleNewmodal}>
              <Modal.Header closeButton>
                <Modal.Title>New Issue</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Topic:
                <input type="text" value={this.state.newtopic} onChange={this.handlenewtopicChange} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.createissue}>
                  OK
                </Button>
                <Button variant="primary" onClick={this.handleNewmodal}>
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>
          </Col>
        );
        
      }
    }

export default Issues;
