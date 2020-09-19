import React, { Component } from 'react';
import {Modal,Button} from 'react-bootstrap'
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import apicallpost from '../component/POST';
// import ace from 'brace';
// import 'brace/mode/json';
// import 'brace/theme/github';
import brace from 'brace'
import 'brace/mode/json';
import 'brace/theme/tomorrow_night_eighties';
import Ajv from 'ajv';

class TagRenderer extends Component {
    constructor(props){
        super(props)
        // console.log(props.rowIndex,props.params,props.value,this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data.ip)
        this.state={
            content:(props.params.tags === null ? "{}" : props.params.tags),
            open:false,
            tempcontent:JSON.parse((props.params.tags === null ? "{}" : props.params.tags).replace(/\'/g,"\""))
        }
        this.handleModal = this.handleModal.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.makeChange = this.makeChange.bind(this)
    }
    
    handleModal(){
        // console.log(this.state.open)
        if(this.state.open){
            this.setState({open:false})
        }else{
            this.setState({open:true,tempcontent:JSON.parse((this.props.params.tags === null ? "{}" : this.props.params.tags).replace(/\'/g,"\""))})
        }
    }

    handleChange(event){
        // console.log(event)
        this.setState({tempcontent:event})
    }

    makeChange(){
        var data = this.state.tempcontent

        const endpoint = '../api/tags/'+this.props.params.ip+'/'

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

        this.handleModal()
    }

  render() {
    //   console.log(this.props.params.ip,this.state)\
    const ajv = new Ajv({ allErrors: true, verbose: true });
    return (
        <div>
            <p onClick={this.handleModal} style={{width:"100%"}}>{this.state.content}</p>
            <Modal show={this.state.open} onHide={this.handleModal}>
                <Modal.Header closeButton>
                <Modal.Title>Tag</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Editor ace={brace} mode={"code"} ajv={ajv} theme="brace/theme/tomorrow_night_eighties" value={this.state.tempcontent} onChange={this.handleChange}/>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.makeChange}>
                    Change
                </Button>
                <Button variant="primary" onClick={this.handleModal}>
                    Cancel
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
  }
}
export default TagRenderer;