import React, { Component } from 'react';
import 'whatwg-fetch'
import MyTable from '../component/MyTable'
import {Button} from 'react-bootstrap'
import apicallget from '../component/GET'
import apicallpost from '../component/POST'

import Creatable from 'react-select/creatable';
import Select from 'react-select'

import {Table, Row, Col} from 'react-bootstrap'

class Issue extends Component {

  constructor(props) {
    super(props);
    this.state = {
        topic: "",
        start_time: "",
        status: "open",
        related:"",
        new: false,
        def:[
            {headerName:"User", field: "user", sortable: true, filter: true},
            {headerName:"Time", field: "time", sortable: true, filter: true},
            {headerName:"Content", field:"content", sortable: true, filter: true},
        ],
        data:[],
        relations:[],
        newchat:"",
        newtopic:"",
        interval:null
    }
    this.loadIssue = this.loadIssue.bind(this)
    this.closeIssue = this.closeIssue.bind(this)
    this.addrelation = this.addrelation.bind(this)
    this.handlerelationsChange = this.handlerelationsChange.bind(this)
    this.handlenewtopicChange = this.handlenewtopicChange.bind(this)
    this.handlenewchatChange = this.handlenewchatChange.bind(this)
    this.addchat = this.addchat.bind(this)
    this.createissue = this.createissue.bind(this)
    this.cancel = this.cancel.bind(this)
    this.reloadIssue = this.reloadIssue.bind(this)
  }

  handlerelationsChange(event){
    // console.log(event)
    // this.setState({
    //     newrelations:event.target.value
    // })
    var relations = []
    var i;
    if(event != null){
      for(i=0;i<event.length;i++){
        relations.push(event[i].value)
      }
    }
    // console.log(relations)
    this.addrelation(relations)
  }

  handlenewtopicChange(event){
    this.setState({
        newtopic:event.target.value
    })
  }

  handlenewchatChange(event){
      this.setState({
          newchat:event.target.value
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
                mycomp.setState({new:false})
                mycomp.loadIssue()
            }
        }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
}

  cancel(){
    this.props.history.push({
        pathname:"/issues",
      })
}

  loadIssue(){
      var id = this.props.match.params.id
      const endpoint = '../api/issue/'+id+'/'

      let mycomp = this

      apicallget(endpoint).then(
        function(responseData){
            var _data = responseData
            // console.log(_data)
            
            var _relations = []
            var i;
            for(i=0;i<_data.related.length;i++){
              if(_data.status === "open"){
                _relations.push({"label":_data.related[i],"value":_data.related[i]})
              }else{
                _relations.push({"label":_data.related[i],"value":_data.related[i],isFixed:true})
              }
            }

            mycomp.setState({topic:_data.topic, relations:_relations, start_time:_data.start_time, status:_data.status, data:_data.chats})
        }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
  }

  reloadIssue(){
      if(this.state.status === 'open'){
          this.loadIssue()
      }
  }

  closeIssue(){
    var id = this.props.match.params.id
    const endpoint = '../api/issue/'

    var data = {
        'id':id,
        'type':'close_issue',
    }

    let mycomp = this

    apicallpost(endpoint,data).then(
        function(responseData){
            mycomp.loadIssue()
        }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
}

  addrelation(_relations){
    var id = this.props.match.params.id
    const endpoint = '../api/issue/'

    var data = {
        'id':id,
        'type':'add_relation',
        'relation':_relations
    }

    let mycomp = this

    // console.log(data)

    apicallpost(endpoint,data).then(
        function(responseData){
            mycomp.loadIssue()
        }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
}

  addchat(){
    var id = this.props.match.params.id
    const endpoint = '../api/issue/'

    var data = {
        'id':id,
        'type':'add_new_chat',
        'chat':this.state.newchat
    }

    let mycomp = this

    apicallpost(endpoint,data).then(
        function(responseData){
            mycomp.loadIssue()
            this.setState({newchat:""})
        }
      ).catch(
        function(error){
          console.log("error", error)
        }
      )
}

  componentDidMount(){
    var id = this.props.match.params.id
    if (id === 'new'){
        this.setState({new:true})
    }else{
        this.setState({new:false})
        this.loadIssue()
        var _interval = setInterval(this.reloadIssue, 10000);
        this.setState({interval:_interval})
    }
  }

  componentWillUnmount(){
      if(this.state.interval != null){
        clearInterval(this.state.interval)
      }
  }

  render() {
      var closebutton, addrelationbutton, relationinput, chatinput, chatsendbutton, refresh, barname;
      const _styles = {
        multiValue: (base, state) => {
          return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
        },
        multiValueLabel: (base, state) => {
          return state.data.isFixed
            ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
            : base;
        },
        multiValueRemove: (base, state) => {
          return state.data.isFixed ? { ...base, display: 'none' } : base;
        },
      };
      if (this.state.status === 'open'){
          closebutton = (<Button variant="dark" style={{borderColor:"transparent"}} onClick={this.closeIssue}>Close</Button>)
          // addrelationbutton = (<Button variant="dark" style={{borderColor:"transparent"}} onClick={this.addrelation}>Add</Button>)
          // relationinput = (<input type="text" value={this.state.newrelations} onChange={this.handlerelationsChange} />)
          relationinput = (<Creatable placeholder="Add Relations..." value={this.state.relations} isMulti={true} onChange={this.handlerelationsChange} />)
          chatinput = (<textarea value={this.state.newchat} onChange={this.handlenewchatChange} />)
          chatsendbutton = (<Button variant="dark" style={{borderColor:"transparent"}} onClick={this.addchat}>Send</Button>)
          refresh = null
          barname = ""
      }else{
          closebutton = null;
          addrelationbutton = null;
          relationinput = (<Select value={this.state.relations} styles={_styles} isMulti={true}  />);
          chatinput = null;
          chatsendbutton = null;
          refresh = null
          barname = ""
      }
      if (this.state.new === false){
        return (
          <Col style={{flexGrow:1}}>
              <Row style={{ width: '100%', height: '20%' }}>
                <Col>
                <h4>Basic Info</h4>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td>Topic:{this.state.topic}</td>
                      <td>Start Time:{this.state.start_time}</td>
                    </tr>
                    <tr>
                      <td>Status:{this.state.status}</td>
                      <td>{closebutton}</td>
                    </tr>
                  </tbody>
                </Table>
                </Col>
              </Row>
              <Row style={{ width: '100%', height: '20%' }}>
                <Col>
                  <h4>Related</h4>
                  <h4>{this.state.related}</h4>
                  <p>{barname}</p>
                  {relationinput}
                  <br />
                  {addrelationbutton}
                </Col>
              </Row>
              <Row style={{ width: '100%', height: '40%' }}>
                <Col>
                  <MyTable columnDefs={this.state.def} rowData={this.state.data} pagination={true} 
                  rowResize={true}
                  keepbottom={true}
                  header={
                    (
                      <div style={{display: "inline-flex", flexDirection: "row"}}>
                        <h4>Chat</h4>
                        {refresh}
                      </div>
                    )
                  }
                  headerhight="10%"
                  tablehight="90%"
                  />
                </Col>
              </Row>
              <Row style={{ width: '100%', height: '20%' }}>
                <Col>
                  {chatinput}
                  <br />
                  {chatsendbutton}
                </Col>
              </Row>
            </Col>
          );
      }else{
        return (
          <Col style={{flexGrow:1}}>
            <h4>Input A Topic</h4>
            <div style={{marginTop:"1vh",display: "inline-flex", flexDirection: "row"}}>
              <input type="text" value={this.state.newtopic} onChange={this.handlenewtopicChange} />
              <Button variant="dark" style={{borderColor:"transparent"}} onClick={this.createissue}>OK</Button><Button variant="dark" style={{borderColor:"transparent", backgroundColor:"#e0dede", color:"black"}} onClick={this.cancel}>Cancel</Button>
            </div>
          </Col>
          );
      }
  }
}

export default Issue;
