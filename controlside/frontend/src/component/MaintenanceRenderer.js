import React, { Component } from 'react';
import {Modal,Button,Form} from 'react-bootstrap'
import apicallpost from '../component/POST';

class MaintenanceRenderer extends Component {
    constructor(props){
        super(props)
        // console.log(props.rowIndex,props.params,props.value,this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data.ip)
        this.state={
            content:(props.params.maintenance === "maintenance" ? true : false),
            open:false,
        }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event){
        // console.log(event.target)
        var _ip = this.props.params.ip
        var data = {}
        data[_ip] = !(this.state.content);
        // console.log(data)

        const endpoint = '../api/maintenance/'

        var mycomp = this;

        apicallpost(endpoint,data).then(
            function(responseData){
                // console.log(responseData)
                if(responseData.success === true){
                    mycomp.props.callback()
                }
            }
        ).catch(
            function(error){
                console.log("error", error)
            }
        )
    }

  render() {
    //   console.log(this.props.params.ip,this.state)\
    return (
        <div>
            <Form.Check id="maintenance" checked={this.state.content} onClick={this.handleChange}/>
        </div>
    )
  }
}
export default MaintenanceRenderer;