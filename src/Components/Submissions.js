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
const apiUrl = process.env.API_URL || `http://192.168.0.248:1337`;
const strapi = new Strapi(apiUrl);

class Submissions extends Component {
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
                            employees {
                                _id
                                fname
                                lname
                            }
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
            return prop.file.toLowerCase().includes(searchTerm.toLowerCase()) || prop.application.name.toLowerCase().includes(searchTerm.toLowerCase());
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
                placeholder="Search Submissions or Apps" 
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
                        backgroundColor: '#ddd'
                    }
                }}
                shape= "rounded"
                >
                    <div className="fixed-action-btn">
                        <Link style={{backgroundColor: '#333', marginRight: '20px'}} className="btn-floating btn-large right" to={`/newsubmission`}>
                            <i className="material-icons" style={{color: 'hsl(128, 100%, 50%)'}}>add</i>
                        </Link>
                    </div>
            {this.filteredItems(this.state).map(sub => {
                console.log(sub);
                return(
                    <div className="card" key={sub._id} style={{marginTop: '30px', width: '100%', display: 'inline-grid', marginRight: '3px', marginLeft: '3px'}}>
                    <div className="card-title" style={{textAlign: 'center'}}>{sub.file}</div>
                    <div className="card-image" style={{height: '50%', width: '50%'}}>
                        <Image src={`${apiUrl}${sub.vendor.logo.url}`} alt={`${sub.vendor.logo._id}`} className='coffeeimage' style={{width: '10%', height: '10%'}}/>
                    </div>
                    <div className="card-content" style={{backgroundColor:'#686c72'}}>    
                        <p></p>
                        <p>Manufacturer : <Link className="right" style={{color: '#7FFF00'}} to={`/manufacturer/${sub.vendor._id}`}>{sub.vendor.name}</Link></p>
                        <p>Jurisdictions: <br />{sub.jurisdictions.map(a => {
                            return (
                                <span className="right">
                                <Link style={{color: 'orange'}}to={`/jurisdiction/${a._id}`}>{a.jurisdiction} {'\u00A0'}</Link>
                                </span>
                            )
                        })} </p> 
                        <p>Application: <Link className="right" style={{color: '#7FFF00'}} to={`/application/${sub.application._id}`}>{sub.application.name}</Link></p>
                        <p>Version: {sub.versions.map(a => {
                            return (
                                <span className="right" style={{color: 'yellow'}}>{a.version}</span>
                            )
                        })}</p>
                        <p>
                    Assigned Engineers: {sub.employees.map(a=> {
                        return (
                    <span className="right" style={{color: 'red'}}>{a.fname} {a.lname} {'\u00A0'}</span>
                        )
                    })}
                        </p>
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

export default Submissions;