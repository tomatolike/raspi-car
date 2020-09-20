import React, { Component } from 'react';
import {Spinner,OverlayTrigger,Popover} from 'react-bootstrap'

class MigrateRenderer extends Component {
    constructor(props){
        super(props)
        this.state={
            status:props.params.migration_status,
            error:props.params.migration_aimed,
            time:props.params.migration_time,
        }
    }
  render() {
    //   console.log(this.props.params.ip,this.state)
    var res,msg;
      if (this.state.status === "Migrating"){
          res = (
              <Spinner animation="border" variant="warning" size="sm" />
          )
          msg = this.state.error
      }else if (this.state.status==="Migrated"){
       
        res = (
          
              <p style={{color:"green"}}>Migrated</p>
        )
        msg = this.state.error
        
      }else if(this.state.status === "Failed"){
        res = (
              <p style={{color:"red"}}>Failed</p>
        )
        msg = this.state.error
      }
      else{
          res = (
            <p style={{color:"#fcc603"}}></p>
          )
          msg = "No Miagration Info"
      }
      return (
        <OverlayTrigger
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Title as="h5">To</Popover.Title>
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
export default MigrateRenderer;