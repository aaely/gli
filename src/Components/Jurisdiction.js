import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Jurisdiction extends Component {
    state = {
        loadingItems: true,
        jurisdiction: '',
        submissions: [],
        approvalstatuses: []
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    jurisdiction (id : "${this.props.match.params.jurisdictionId}") {
                        jurisdiction
                        approvalstatuses {
                            _id
                            status
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
                        
                  }
                }`
            }
        }
        );
        this.setState({
            jurisdiction: response.data.jurisdiction.jurisdiction,
            approvalstatuses: response.data.jurisdiction.approvalstatuses,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { jurisdiction, approvalstatuses, loadingItems } = this.state;
        console.log(approvalstatuses);
        return(
            <div style={{textAlign: 'center'}}>
                <h1>Jurisdiction</h1> <br />
                <h4>{jurisdiction}</h4> <br />
                <h3>Submissions for {jurisdiction}</h3>
                {approvalstatuses.map(app => {
                    return(
                        <div>
                            {app.status} <br />
                            {app.submissions.map(sub => {
                                return (
                                <p>
                                <Link to={`/submission/${sub._id}`}>{sub.file}</Link><br />
                                {sub.application.name} {sub.versions.map(a => {
                                    return (
                                        <span>{a.version}</span>
                                    )
                                })}
                            
                            </p>)
                        })}</div>
                    );
                })}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Jurisdiction;