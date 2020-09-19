import React, { Component } from 'react';

class MyLinkRenderer extends Component {
    constructor(props){
        super(props)
        this.state={
            to:props.to,
            params:props.params,
            content:props.content
        }
        this.onClick = this.onClick.bind(this)
    }
    onClick(){
        // console.log(this.props)
        this.props.history.push({
            pathname:this.state.to,
            state:{
              params:this.state.params,
            }
          })
    }
  render() {

      return (
        <a onClick={this.onClick} style={{color:"blue"}}>{this.state.content}</a>
      )
  }
}
export default MyLinkRenderer;