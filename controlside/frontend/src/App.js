import React, { Component } from 'react';
import './App.css';
import {Container, Row} from 'react-bootstrap'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: true,
      
      
    };
  }

  render() {
    return (
      <div>Hello World!</div>
    );
  }
}

export default App;
