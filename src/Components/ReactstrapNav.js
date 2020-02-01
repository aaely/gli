import React, { Component } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText
  } from 'reactstrap';
  import {Avatar} from 'gestalt';

  class ReactstrapNav extends Component {

    constructor(props) {
        super(props);
        this.toggleNavbar = this.toggleNavbar.bind(this)
        this.state = {
            isOpen: false
        }
    }

    toggleNavbar() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }
      
    render() {
        let { isOpen } = this.state;
        return(
            <div>
                <Navbar color='dark' expand='md' dark>
                    <NavbarBrand style={{color: '#ffd900'}} href="/">GLI Engineering
                        
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} />
                    <Collapse isOpen={isOpen} navbar>
                        <Nav className='ml-auto' navbar>
                            <NavItem>
                                <NavLink href="https://gaming.nv.gov/index.aspx?page=332" style={{color: 'rgb(0, 255, 34)'}} >NV Hardware Approvals</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="www.dayforcehcm.com" style={{color: 'rgb(0, 255, 34)'}} >Acumatica</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="http://njintranet5/sites/engineering/LVSystems/wiki/Wiki%20Pages/Current%20Network%20Layout.aspx" style={{color: 'rgb(0, 255, 34)'}} >Network Layout</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="http://nvutility/inoutpro.php" style={{color: 'rgb(0, 255, 34)'}}>In/Out Board</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://gaminglabs.acumatica.com/Frames/Login.aspx?ReturnUrl=%2f" style={{color: 'rgb(0, 255, 34)'}}>TimeCard</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="http://njintranet5/sites/qms/GLI%20Document%20Library/Forms/cpcojur.aspx" style={{color: 'rgb(0, 255, 34)'}}>Paper Checkoffs</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink style={{color: 'rgb(0, 255, 34)'}} href="http://njintranet5/sites/qms/GLI%20Document%20Library/Forms/AllItems.aspx?RootFolder=%2Fsites%2Fqms%2FGLI%20Document%20Library%2FCompliance%2FNV%20Test%20Scripts&FolderCTID=0x01200040B21164CAE9884D89C3863D8C3F3795&View=%7B954970DD%2DF263%2D4040%2D9706%2D0C6F98F7B90F%7D">Test Cases</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="http://submissions/gliintranet/search/advancedsearch" style={{color: 'rgb(0, 255, 34)'}}>Submissions Database</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://tracker.gaminglabs.com:8443/issues/?jql=ORDER%20BY%20updated%20DESC" style={{color: 'rgb(0, 255, 34)'}}>JIRA</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }
  }

  export default ReactstrapNav;