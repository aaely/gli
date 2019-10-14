import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://192.168.0.178:1337';
const strapi = new Strapi(apiUrl);

class Jurisdiction extends Component {
    state = {
        loadingItems: true,
        jurisdiction: [],
        submissions: []
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    jurisdiction (id : "${this.props.match.params.jurisdictionId}") {
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
                  }
                }`
            }
        }
        );
        this.setState({
            jurisdiction: response.data.jurisdiction.jurisdiction,
            submissions: response.data.jurisdiction.submissions,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { jurisdiction, submissions, loadingItems } = this.state;
        console.log (submissions);
        return(
            <div style={{textAlign: 'center'}}>
                <h1>Jurisdiction</h1> <br />
                <h4>{jurisdiction}</h4> <br />
                <h3>Submissions for {jurisdiction}</h3>
                {submissions.map(sub => {
                    return(
                        <div>
                            <Link to={`/submission/${sub._id}`}>{sub.file}</Link>
                            <p>
                            {sub.application.name} {sub.versions.map(a => {
                                return (
                                    <span>{a.version}</span>
                                )
                            })}
                            </p>
                        </div>
                    );
                })}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Jurisdiction;