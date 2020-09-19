import React, { Component } from 'react';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import {InputGroup,Col,Button,FormControl} from 'react-bootstrap'
import apicallpost from '../component/POST'

class Test extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username:"",
      password:""
    };
  }

  handleUsernameChange(event){
    this.setState({username:event.target.value})
  }

  handlePasswordChange(event){
    this.setState({password:event.target.value})
  }

  login(){
    
    var data = {
      'username':this.state.username,
      'password':this.state.password
    }

    console.log("Login:",data)

    let mycomp = this
    
    const endpoint = '../api/login/'
    apicallpost(endpoint,data).then(
      function(responseData){
        console.log(responseData)
      }
    ).catch(
      function(error){
        console.log("error", error)
      }
    )
  }

  render() {
    return (
      <Col>
        <InputGroup>
          <FormControl
            placeholder="Username"
            onChange={this.handleUsernameChange.bind(this)}
          />
        </InputGroup>
        <InputGroup>
        <FormControl
          placeholder="Password"
          onChange={this.handlePasswordChange.bind(this)}
        />
      </InputGroup>
      <Button onClick={this.login.bind(this)} >Login</Button>
    </Col>
    );
  }
}

export default Test;