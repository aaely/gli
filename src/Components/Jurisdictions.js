import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class Jurisdictions extends Component {
    state = {
        loadingItems: true,
        jurisdictions: []
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    jurisdictions {
                        _id
                        jurisdiction
                        submissions {
                          _id
                          file
                          application {
                              _id
                              name
                          }
                          versions {
                              _id
                              version
                          }
                        }
                        number
                  }
                }`
            }
        }
        );
        this.setState({
            jurisdictions: response.data.jurisdictions,
            loadingItems: false
        });
        console.log(this.state);
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    /*renderSubmissions() {
        let { jurisdictions } = this.state;
        return (
            <div>
                {jurisdictions.submissions.map(a => {
                   return ( <p>{a.file}</p>)
                })}
            </div>
        )
    }*/

    render() {
        let { jurisdictions, loadingItems } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                {jurisdictions.map(a => {
                return (<p>
                <h1>{a.jurisdiction} ({a.number})</h1> <br />
                <h3>Submissions: </h3>
                {a.submissions.map(b => {
                    return (
                        <p>{b.file} <br />
                        {b.application.name} {b.versions.map(c => {
                            return (
                                <span>{c.version}</span>
                            )
                        })}</p>
                    )
                })}
                </p>)
                })}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Jurisdictions;