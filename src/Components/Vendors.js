import React, { Component } from 'react';
import { Box,
    Heading,
    Text,
    Image,
    Mask,
    Card,
    Button,
    Container, 
    IconButton} from 'gestalt';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://nv-dt-534:1337';
const strapi = new Strapi(apiUrl);

class Vendors extends Component {
    state = {
        applications: [],
        vendor: '',
        loadingItems: true,
        searchTerm: ''
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    vendor (id: "${this.props.match.params.vendorId}") {
                    _id
                    name
                    applications {
                        _id
                        name
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            applications: response.data.vendor.applications,
            vendor: response.data.vendor.name,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }
    render() {
        let { vendor, applications } = this.state;
        return(
            <Container>
            <Box
            marginTop={5}
            display="flex"
            justifyContent="center"
            alignItems="start"
            dangerouslySetInlineStyle={{
                __style: {
                    flexWrap: "wrap-reverse"
                }
            }}
            >
            <Box display="flex" direction="column" alignItems="center">
                <Box marginBottom={5}>
                    <Heading color="blue">{vendor}</Heading>
                <Text>
                    {applications.map(app => {
                        return(
                            <Box>
                                <Link to={`/application/${app._id}`}>{app.name}</Link>
                            </Box>
                        );
                    })}
                </Text>
                </Box>
            </Box>
            </Box>
            </Container>
        );
    }
}

export default Vendors;