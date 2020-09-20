import React, { Component } from 'react';
import {Button,OverlayTrigger,Popover} from 'react-bootstrap';
import {Link} from 'react-router-dom';

class IssueRenderer extends Component {
    constructor(props){
        super(props)
        this.state={
            count:props.params.issues_count,
            issues_list:props.params.issues_list
        }
        this.onButtonClick = this.onButtonClick.bind(this)
    }

    onButtonClick(){
        // console.log("Clicked")
    }
    
  render() {
    //   console.log(this.props.params.ip,this.state)
    var issuelist,i;
    issuelist = [];
    if(this.state.issues_list != null){
        for(i=0;i<this.state.issues_list.length;i++){
            issuelist.push(
                <li key={i}><Link to={'/issue/'+this.state.issues_list[i].issue_id} >{this.state.issues_list[i].issue_topic}</Link></li>
            )
        }
    }

        var res;
        res = null;
    
      if (this.state.count > 0){
          res =  (
                <Button  variant="light" style={{backgroundColor:"transparent",borderColor:"transparent",color:"red"}}>Open</Button>
          )
      }else{
          res = (
            <Button variant="light" style={{backgroundColor:"transparent", borderColor:"transparent",color:"green"}} disabled>Closed</Button>
          )
      }

      return (
        (
            <OverlayTrigger
            trigger={["click"]}
            placement="top"
            overlay={
                <Popover id={`popover-positioned-top`}>
                <Popover.Title as="h5">Open Issues</Popover.Title>
                <Popover.Content>
                    {issuelist}
                </Popover.Content>
                </Popover>
            }
            >
                {res}
            </OverlayTrigger>
          )
      )
  }
}
export default IssueRenderer;