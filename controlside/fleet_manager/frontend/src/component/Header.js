import React, { Component } from 'react';

import {Navbar} from 'react-bootstrap';

class Header extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
          text: this.props.text,
        };
    }

    render(){
        return (
            <Navbar fixed="top" variant="dark" style={{background:"black", width:"100%", height:"5vh"}}>
              <Navbar.Brand href="/machines/">
                <img
                  alt=""
                  src="/static/img/anchor.ico"
                  width="30"
                  height="30"
                  className="d-inline-block align-top"
                />
                {this.props.text}
              </Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  [Unknown]
                </Navbar.Text>
              </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Header;