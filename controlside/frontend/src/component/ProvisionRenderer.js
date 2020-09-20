import React, { Component } from 'react';
import {Spinner,OverlayTrigger,Popover} from 'react-bootstrap'

class ProvisionRenderer extends Component {
    constructor(props){
        super(props)
        this.state={
            status:props.params.provision_status,
            error:props.params.provision_brief,
            time:props.params.provision_time,
        }
    }
  render() {
    //   console.log(this.props.params.ip,this.state)
    var res,msg = null;
      if (this.state.status === "Provisioning"){
          res = (
            
                <Spinner animation="border" variant="warning" size="sm" />
            
          )
          msg = this.state.error
      }else if (this.state.status==="Done"){
        res = (
          
              <p style={{color:"green"}}>Done</p>
            
        )
        msg = this.state.error
      }else if(this.state.status==="Failed"){
          res = (
            
              <p style={{color:"red"}}>Failed</p>
          )
          msg = this.state.error
      }else{
          res = (
            <p style={{color:"#fcc603"}}></p>
          )
          msg = "No Provision Info"
      }

      return (
        <OverlayTrigger
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Title as="h5">Brief</Popover.Title>
                <Popover.Content>
                {msg}
                <br/>
                last time: {this.state.time}
                </Popover.Content>
                </Popover>
            }
            >
              {res}
            </OverlayTrigger>
      )
  }
}
export default ProvisionRenderer;