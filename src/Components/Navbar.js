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

                <NavLink to="/Dashboard" activeClassName="active">
                <Text size="xl" color="white">More Content</Text>
                </NavLink>

            </Box>
        );
    }
}

export default Navbar;