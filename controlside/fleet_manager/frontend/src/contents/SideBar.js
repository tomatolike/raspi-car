import React, { Component } from 'react';
import { Link} from 'react-router-dom';
import {Col} from 'react-bootstrap'
class SideBar extends Component {

  constructor(props) {
    super(props);
    this.state={
        content: {
          width:"100%",
          // backgroundColor: "white"
          },
          sidebarLink: {
            display: "block",
            // padding: "16px 0px",
            paddingTop: "32px",
            paddingDown: "32px",
            color: "white",
            textAlign:"center",
            // backgroundColor:"gray",
            textDecoration: "none",
            width:"100%"
          },
        width:100,
    }
    this.mycolumn = React.createRef()
  }

  componentDidMount(){
    // console.log(this.mycolumn.current.offsetWidth)
    this.setState({width:this.mycolumn.current.offsetWidth})
  }

  render() {
    return (
      // <div style={{position:"fixed", backgroundColor:"blue",width:"100%", height:"100%"}}>
      //   <div style={this.state.content} ><Link to="/machines/" style={this.state.sidebarLink}>Machines</Link></div>
      //   <div style={this.state.content} ><Link to="/status/" style={this.state.sidebarLink}>Update Status</Link></div>
      //   {/* <div style={this.state.content} ><Link to="/migrations/" style={this.state.sidebarLink}>Migrations</Link></div> */}
      //   <div style={this.state.content} ><Link to="/issues/" style={this.state.sidebarLink}>Issues</Link></div>
      // </div>
      <Col xs={1} ref={this.mycolumn} style={{background:"#2e2e28", justifyContent:"flex-start", alignItems:"flex-start", flexGrow:1}}>
        <div style={{backgroundColor:"transparent", position:"fixed", width:this.state.width-20, height:"100%"}}>
          <Link to="/machines/" style={this.state.sidebarLink}>Machines</Link>
          <Link to="/datacenters/" style={this.state.sidebarLink}>Datacenters</Link>
          <Link to="/status/" style={this.state.sidebarLink}>Update Status</Link>
          <Link to="/issues/" style={this.state.sidebarLink}>Issues</Link>
        </div>
      </Col>
    );
  }
}

export default SideBar;
