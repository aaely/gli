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
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class Appwiki extends Component {
    state = {
        application: [],
        submissions: [],
        loadingItems: true
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    application (id: "${this.props.match.params.applicationId}") {
                    _id
                    name
                    submissions {
                        _id
                        file
                        versions {
                            _id
                            version
                        }
                        jurisdictions {
                            _id
                            jurisdiction
                            approvalstatuses {
                                _id
                                status
                            }
                        }
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            application: response.data.application,
            submissions: response.data.application.submissions,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { loadingItems, application, submissions } = this.state;
        console.log(this.state);
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
                    <Heading color="blue">{application.name}</Heading>
                    <p>this is working</p>
                {submissions.map(a => {
                    return (
                        <p>
                            {a.file} <br />
                            {a.versions.map(b => {
                                return (
                                    <span>{b.version}</span>
                                )
                            })}<br />
                            {a.jurisdictions.map(c => {
                                return (
                                    <p>{c.jurisdiction} -- Status: {c.approvalstatuses.map(d => {
                                        return (
                                            <span>{d.status}</span>
                                        )
                                    })}   </p>
                                )
                            })}
                        </p>
                    )
                })}
                <p><h1>This is working</h1></p>
                </Box>
            </Box>
            </Box>
            {loadingItems && <Loader />}
            </Container>
        );
    }
}

export default Appwiki;