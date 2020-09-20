import React, { Component } from 'react';
import './App.css';
import './contents/Machines'
import Machines from './contents/Machines';
import Datacenters from './contents/Datacenters';
import Machine from './contents/Machine';
import Status from './contents/Status'
import { BrowserRouter, Route, Switch} from 'react-router-dom'
import SideBar from './contents/SideBar'
import Header from './component/Header'
import Migrate from './contents/Migrate'
import Issues from './contents/Issues'
import Issue from './contents/Issue'
import Provision from './contents/Provision'
import Test from './contents/Test'

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
      // <div style={{ width: '100%', height: '100%' }}>
      //   <div style={{ width: '100%', height: '100%' }}>
      //     <Test />
      //   </div>
      // </div>
      <BrowserRouter>
        <Container fluid>
          <Row style={{height:"5vh"}}>
            <Header text="Fleet Manager"/>
          </Row>
          <Row style={{minHeight:"95vh", display:"flex", flexWrap:"wrap"}}>
            
              <SideBar />
            
            {/* <Col style={{flexGrow:1, background:"green", height:"400vh"}}> */}
            <Switch>
              {/* <Route exact path='/login/' component={Test}/> */}
              <Route exact path='/machine/:ip' component={Machine}/>
              <Route exact path='/machines/' component={Machines} />
              <Route exact path='/datacenters/' component={Datacenters} />
              <Route exact path='/issues/' component={Issues} />
              <Route exact path='/status/' component={Status}/>
              <Route exact path='/migrate/:id' component={Migrate}/>
              <Route exact path='/newprovision/' component={Provision}/>
              <Route exact path='/issue/:id' component={Issue}/>
              <Route exact path='/' component={Machines}/>
            </Switch>
            {/* </Col> */}
          </Row>
        </Container>
      </BrowserRouter>
    );
  }
}

export default App;
