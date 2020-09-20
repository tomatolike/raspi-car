import React, { Component } from 'react';
import './App.css';
import apicallpost from './component/POST'
import apicallget from './component/GET'
import {Container, Row, Col, Table, Button} from 'react-bootstrap'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      W:false,
      S:false,
      A:false,
      D:false,
      stop:true,
      last:null,
      interval:null,
      status:'stop',
      connected:false,
      addr:'',
      timeset:50,
    };
    this.keydown=this.keydown.bind(this);
    this.keyup=this.keyup.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.apiget = this.apiget.bind(this);
    this.apicall = this.apicall.bind(this);
    this.touchstart = this.touchstart.bind(this);
    this.touchend = this.touchend.bind(this);
  }

  keydown(event){
    // console.log(event.keyCode);
    if(event.keyCode==87){
      this.setState({W:true,last:'W'})
    }
    if(event.keyCode==83){
      this.setState({S:true,last:'S'})
    }
    if(event.keyCode==65){
      this.setState({A:true,last:'A'})
    }
    if(event.keyCode==68){
      this.setState({D:true,last:'D'})
    }
  }

  touchstart(event){
    // console.log(event.target.id)
    if(event.target.id == 'w'){
      this.setState({W:true,last:'W'})
    }
    if(event.target.id == 's'){
      this.setState({W:true,last:'S'})
    }
    if(event.target.id == 'a'){
      this.setState({W:true,last:'A'})
    }
    if(event.target.id == 'd'){
      this.setState({W:true,last:'D'})
    }
  }

  keyup(event){
    // console.log(event.keyCode);
    if(event.keyCode==87){
      this.setState({W:false})
    }
    if(event.keyCode==83){
      this.setState({S:false})
    }
    if(event.keyCode==65){
      this.setState({A:false})
    }
    if(event.keyCode==68){
      this.setState({D:false})
    }
  }

  touchend(event){
    // console.log(event)
    if(event.target.id == 'w'){
      this.setState({W:false,last:'W'})
    }
    if(event.target.id == 's'){
      this.setState({W:false,last:'S'})
    }
    if(event.target.id == 'a'){
      this.setState({W:false,last:'A'})
    }
    if(event.target.id == 'd'){
      this.setState({W:false,last:'D'})
    }
  }

  apicall(status){
    var data = {'type':'move','order':status}

    let mycomp = this
    
    const endpoint = '../api/move/'
    apicallpost(endpoint,data).then(
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  apiget(){
    let mycomp = this

    let endpoint = '../api/move/'
    apicallget(endpoint).then(
      function(responseData){
        console.log(responseData)
        mycomp.setState({connected:responseData.data.connected,addr:responseData.data.addr[0]})
        }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  updateStatus(){
    if(this.state.W != true && this.state.S != true && this.state.A != true && this.state.D != true){
      if(this.state.status != 'stop'){
        this.setState({status:'stop'});
        this.apicall('stop');
      }
    }else{
      var _last = this.state.last
      if(this.state.status != _last){
        this.setState({status:_last});
        this.apicall(_last);
      }
    }
    var _time = this.state.timeset;
    _time = _time-1;
    if(_time == 0){
      this.apiget();
      this.setState({timeset:50})
    }else{
      this.setState({timeset:_time})
    }
  }

  componentDidMount(){
    var _interval = setInterval(this.updateStatus, 100);
    this.setState({interval:_interval})
  }

  render() {
    var _url = 'http://'+this.state.addr+':8081/mjpeg'
    return (
      <Container fluid>
        <Row style={{minHeight:"25vh", display:"flex", flexWrap:"wrap",alignItems:'center',alignContent:'center'}}>
          <Col style={{flexGrow:1}}>
            <img src={_url}/>
          </Col>
        </Row>
        <Row style={{height:"25vh",alignItems:'center',alignContent:'center'}}>
          <Col style={{flexGrow:1}}>
            moving:{this.state.status}<br/>
            network:{this.state.connected}<br/>
            address:{this.state.addr}<br/>
          </Col>
        </Row>
        <Row style={{minHeight:"25vh", display:"flex", flexWrap:"wrap",alignItems:'center',alignContent:'center'}}>
          <Col style={{flexGrow:1}}>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <td></td>
                  <td><Button id='w' onMouseDown={this.touchstart} onTouchStart={this.touchstart} onTouchEnd={this.touchend} onMouseUp={this.touchend} >W</Button></td>
                  <td></td>
                </tr>
                <tr>
                  <td><Button id='a' onMouseDown={this.touchstart} onTouchStart={this.touchstart} onTouchEnd={this.touchend} onMouseUp={this.touchend} >A</Button></td>
                  <td></td>
                  <td><Button id='d' onMouseDown={this.touchstart} onTouchStart={this.touchstart} onTouchEnd={this.touchend} onMouseUp={this.touchend} >D</Button></td>
                </tr>
                <tr>
                  <td></td>
                  <td><Button id='s' onMouseDown={this.touchstart} onTouchStart={this.touchstart} onTouchEnd={this.touchend} onMouseUp={this.touchend} >S</Button></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row style={{minHeight:"25vh", display:"flex", flexWrap:"wrap",alignItems:'center',alignContent:'center'}}>
          <Col style={{flexGrow:1}}>
            <input onKeyDown={this.keydown} onKeyUp={this.keyup} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
