import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from "strapi-sdk-javascript/build/main";
import {Box, 
        SearchField, 
        Icon,
        Image,
        Text,
        Card,
        Button,
        Container } from 'gestalt';
import Loader from './Loader';
const apiUrl = process.env.API_URL || "http://192.168.0.178:1337";
const strapi = new Strapi(apiUrl);

class Manufacturers extends Component {
    state = {
        submissions: [],
        searchTerm: '',
        loadingItems: true
    }

    async componentDidMount() {
        try {
            const response = await strapi.request('POST', '/graphql', {
                data: {
                    query: `query {
                        submissions{
                            _id
                            file
                            received
                            processed
                            begin
                            vendor {
                                _id
                                name
                                logo {
                                  _id
                                  url
                                }
                              }                              
                            jurisdictions {
                              _id
                              jurisdiction
                              number
                            }
                          application {
                            _id
                            name
                          }
                          versions {
                            _id
                            version
                          }
                        }
                    }`
                }
            });
            console.log(response);
            this.setState({ 
                submissions: response.data.submissions,

                loadingItems: false
            });
            console.log(this.state.submissions);
        } catch(err) {
            console.error(err);
            this.setState({ loadingItems: false });
        }
    }

    handleChange = ({ value }) => {
        this.setState({ searchTerm: value});
    };

    filteredItems = ({ searchTerm, submissions }) => {
        return submissions.filter(prop => {
            return prop.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    render() {
        let { loadingItems, searchTerm } = this.state;
        return(
        <Container>
                <Box display="flex" justifyContent="center" marginTop={4} marginBottom={4}>
                <SearchField 
                id="searchField" 
                accessibilityLabel="Items search field" 
                onChange={this.handleChange} 
                placeholder="Search Subissions" 
                value={searchTerm}
                />
                <Box
                margin={2}
                >
                    <Icon 
                    icon="filter"
                    color={searchTerm ? 'orange' : 'gray'}
                    size={20}
                    accessibilityLabel="Filter"
                    />
                </Box>
                </Box>
                <Box wrap display ="flex" 
                justifyContent="around"
                dangerouslySetInlineStyle={{
                    __style: {
                        backgroundColor: '#d6e5ff'
                    }
                }}
                shape= "rounded"
                >
            {this.filteredItems(this.state).map(sub => {
                console.log(sub);
                return(
                    <div className="card" key={sub._id} style={{marginTop: '30px', width: '100%', display: 'inline-block', marginRight: '3px', marginLeft: '3px'}}>
                    <div className="card-title" style={{textAlign: 'center'}}>{sub.file}</div>
                    <div className="card-image">
                        <Image src={`${apiUrl}${sub.vendor.logo.url}`} alt={`${sub.vendor.logo._id}`} className='coffeeimage' style={{width: '10%', height: '10%'}}/>
                    </div>
                    <div className="card-content" style={{backgroundColor:'#686c72'}}>    
                        <p></p>
                        <p>Manufacturer : <span className="right">{sub.vendor.name}</span></p>
                        <p>Jurisdictions: {sub.jurisdictions.map(a => {
                            return (
                                <p>
                                <Link style={{color: 'orange'}}to={`/jurisdiction/${a._id}`}>{a.jurisdiction}</Link>
                                </p>
                            )
                        })} </p> 
                        <p>Application: {sub.application.name}</p>
                        <p>Version: {sub.versions.map(a => {
                            return (
                                <span>{a.version}</span>
                            )
                        })}</p>
                    </div>
                    <div className="card-action" style={{textAlign: 'center', backgroundColor:'#686c72'}}>
                        <Link to={`/submission/${sub._id}`}>{sub.file}</Link>
                    </div>
                    </div>
            )})}
            {loadingItems && <Loader />}
            </Box>
        </Container>
        );
    }
}

export default Manufacturers;