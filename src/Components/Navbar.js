import React, { Component } from 'react';
import { Box, Text, Heading, Image, Avatar } from 'gestalt';
import { NavLink } from 'react-router-dom';

class Navbar extends Component {
    render() {
        return (
            <Box
            display="flex"
            alignItems="center"
            justifyContent="around"
            height={70}
            color="midnight"
            padding={1}
            shape="roundedBottom"
        >       
                
                <NavLink to="/" activeClassName="active">
                    <Text size="xl" color="white">Submissions</Text>
                </NavLink>
                <a style ={{color: 'White', fontSize: '21px'}} href="http://njintranet5/sites/qms/GLI%20Document%20Library/Forms/cpcojur.aspx">Paper Checkoffs</a>
                <NavLink exact to="/" activeClassName="active">
                <Box display="flex" alignItems="center">
                    <Box margin={2} height={50} width={50} shape="roundedBottom">
                    <Avatar
                     alt="PeptideLogo"
                     naturalHeight={1}
                     naturalWidth={1}
                     src="../../icons/glilogo.png"
                    />
                    </Box>
                    <Heading size="xs" color="orange">
                        GLI Internal Wiki
                    </Heading>
                </Box>                    
                </NavLink>

                    <a style ={{color: 'White', fontSize: '21px'}} href="http://njintranet5/sites/qms/GLI%20Document%20Library/Forms/AllItems.aspx?RootFolder=%2Fsites%2Fqms%2FGLI%20Document%20Library%2FCompliance%2FNV%20Test%20Scripts&FolderCTID=0x01200040B21164CAE9884D89C3863D8C3F3795&View=%7B954970DD%2DF263%2D4040%2D9706%2D0C6F98F7B90F%7D">
                        Test Cases
                    </a>
                    <a style ={{color: 'White', fontSize: '21px'}} href="https://tracker.gaminglabs.com:8443/browse/IGT-23715?filter=-4">
                    JIRA
                    </a>
                

            </Box>
        );
    }
}

export default Navbar;