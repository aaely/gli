import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from "strapi-sdk-javascript/build/main";
import Iframe from 'react-iframe';
import {Box, 
        SearchField, 
        Icon,
        Image,
        Text,
        Card,
        Button,
        Container } from 'gestalt';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Manufacturers extends Component {
    /*state = {
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
    };*/

    render() {
        //let { loadingItems, searchTerm } = this.state;
        return(
        <div>
            {/*<Container>
                <Box display="flex" justifyContent="center" marginTop={4} marginBottom={4}>
                <SearchField 
                id="searchField" 
                accessibilityLabel="Items search field" 
                onChange={this.handleChange} 
                placeholder="Search by Manufacturer" 
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
            this.filteredItems(this.state).map(sub => {
                console.log(sub);
                return(
                    <div className="card" key={sub._id} style={{marginTop: '30px', width: '100%', display: 'inline-block', marginRight: '3px', marginLeft: '3px'}}>
                    <div className="card-title" style={{textAlign: 'center'}}>{sub.file}</div>
                    <div className="card-image" style={{height: '50%', width: '50%'}}>
                        <Image src={`${apiUrl}${sub.vendor.logo.url}`} alt={`${sub.vendor.logo._id}`} className='coffeeimage' style={{width: '10%', height: '10%'}}/>
                    </div>
                    <div className="card-content" style={{backgroundColor:'#686c72'}}>    
                        <p></p>
                        <p>Manufacturer : <span className="right">{sub.vendor.name}</span></p>
                        <p>Jurisdictions: {sub.jurisdictions.map(a => {
                            return (
                                <span>
                                <Link style={{color: 'orange'}}to={`/jurisdiction/${a._id}`}>{a.jurisdiction} </Link>
                                </span>
                            )
                        })} </p> 
                        <p>Application: <Link style={{color: '#7FFF00'}} to={`/application/${sub.application._id}`}>{sub.application.name}</Link></p>
                        <p>Version: {sub.versions.map(a => {
                            return (
                                <span style={{textAlign: 'yellow'}}>{a.version}</span>
                            )
                        })}</p>
                    </div>
                    <div className="card-action" style={{textAlign: 'center', backgroundColor:'#686c72'}}>
                        <Link to={`/submission/${sub._id}`}>{sub.file}</Link>
                    </div>
                    </div>
                    )})
                    </Box>
            </Container>*/}
            
                    <Iframe url="http://njintranet5.gaminglabs.net/sites/engineering/LVSystems/wiki/Wiki%20Pages/Current%20Network%20Layout.aspx"
                    width="100%"
                    height="100%"
                    id="myId"
                    className="myClassname"
                    display="initial"
                    position="absolute"/>

            </div>
        );
    }
}

export default Manufacturers;