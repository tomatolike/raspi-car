import React, { Component } from 'react';
import {Spinner,OverlayTrigger,Popover} from 'react-bootstrap'

class DiagnoseRenderer extends Component {
    constructor(props){
        super(props)
        // console.log(props.rowIndex,props.params,props.value,this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data.ip)
        this.state={
            status:props.params.pro_status,
            error:props.params.pro_error,
            time:props.params.pro_time,
        }
    }
  render() {
    //   console.log(this.props.params.ip,this.state)\
    var res,msg;
      if (this.state.status === "Diagnosing"){
          res = (
              <Spinner animation="border" variant="warning" size="sm" />
          )
          msg = this.state.error
      }else if (this.state.status==="Diagnosed"){
        if(this.state.error === "Success"){
            res = (
              
                <p style={{color:"green"}}>Success</p>
            )
          msg = this.state.error
        }else{
            res = (
              
              <p style={{color:"red"}}>{this.state.error}</p>
            )
          msg = this.state.error
        }
      }else{
          res = (
            <p style={{color:"#fcc603"}}></p>
          )
          msg = "No Diagnose Info"
      }
      return (
        <OverlayTrigger
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Title as="h5">Error</Popover.Title>
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
export default DiagnoseRenderer;