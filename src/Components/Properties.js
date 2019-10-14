import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card,
         Image,
         Box,
         Container,
         Text,
         Heading
          } from 'gestalt';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Properties extends Component {
    state = {
        searchTerm: '',
        loadingItems: true,
        property: [],
        applications: []
    }

    async componentDidMount() {
        try {
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    property (id: "${this.props.match.params.propertyId}")  {
                    _id
                    name
                    director
                    manager
                    applications {
                      _id
                      name
                    }
                    image {
                        url
                        name
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            property: response.data.property.name,
            applications: response.data.property.applications,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { property, applications, loadingItems } = this.state;
        return(
            <Container>
                <Box
                marginTop={5} marginBottom={5} justifyContent="center" display="flex"
                >
                <Heading size="lg" color="blue">{property}</Heading> <br />                
                </Box>
                <Box marginTop={5} marginBottom={5} display="flex" justifyContent="center">
                    <Heading size="sm">Applications used by Property</Heading>
                </Box>
                {applications.map(app => {
                    return(
                        <Box display="flex" justifyContent="center">
                            <Link to={`/apps/${app._id}`}>{app.name}</Link>
                        </Box>
                    );
                })}
                
                {loadingItems && <Loader />}                
            </Container>
        );
    }
}

export default Properties;