import React, { Component } from 'react';

class CostomHeader extends Component {
    constructor(props){
        super(props)
        // console.log(props.rowIndex,props.params,props.value,this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data.ip)
        this.state={
        }
    }
  render() {
    //   console.log(this.props)
      return (this.props.content)
  }
}
export default CostomHeader;