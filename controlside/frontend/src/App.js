import React, { Component } from 'react';
import './App.css';
import apicallpost from './component/POST'

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
      status:'stop'
    };
    this.keydown=this.keydown.bind(this);
    this.keyup=this.keyup.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
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
  }

  componentDidMount(){
    var _interval = setInterval(this.updateStatus, 100);
    this.setState({interval:_interval})
  }

  render() {
    return (
      <div >
        {this.state.status}
        <input onKeyDown={this.keydown} onKeyUp={this.keyup} />
      </div>
    );
  }
}

export default App;
