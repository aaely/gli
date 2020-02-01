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
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
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
            
            <p style={{marginLeft: '20px'}}><h4>To clone this repo and run at your own pc, do the following:</h4>
                <ol>
                <li>Ensure <a href='https://gitforwindows.org/'>Git Bash</a> cli is installed and running</li>
                <li>Ensure <a href='https://nodejs.org/en/download/'>NodeJS</a> is installed</li>
                <li>Run the following commands in the git bash terminal <em>(be in the home directory-- c:\users\[username]</em>: <br /> <em>git clone https://github.com/aaely/gli.git</em> <br /> <em>cd gli</em> <br /> npm i <br /> npm start</li>
                <li>Your default browser will open to the dashboard</li>
                <li>It would be best to limit changes to the <strong>src</strong> items, and particularly the <strong>Components</strong></li>
                <li>Ignore the <strong>server</strong> directory for now.</li>
                </ol> <br />
                <br />
                <p style={{marginLeft: '20px'}}>Here is a link to the newest version of VSCode. I use this editor due to all the free extensions. <a href="https://code.visualstudio.com/download">VSCode</a></p>
                <h4>Talk to me (Aaron E) to commit changes to the repo. Repeat this process to update the components to the latest version I have committed.<em> Doing this will cause you to lose changes you may have made that I did not commit</em>. Please, feel free to ask me anything about this.</h4>
            </p>
            </div>
        );
    }
}

export default Manufacturers;