import React, { Component } from 'react';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class ModRewrites extends Component {

    constructor(props) {
        super(props);
        this.state = {
            versions: []
        }
    }

    async componentDidMount() {
        try {
            console.log(this.props.match.params.submissionId);
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id: "${this.props.match.params.submissionId}") {
                        versions {
                            _id
                            version
                            mods {
                                _id
                                rewrite
                            }
                        }
                  }
                }`
            }
        }
        );
        this.setState({
            versions: response.data.submission.versions
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { versions } = this.state;
        console.log(versions);
        return(
            <div>
                <ol>
                    {versions.map(a => {
                        return(
                            <div>
                            <h5 style={{textAlign: 'center'}}><u>{a.version}</u></h5>
                            {a.mods.map(b => {
                                return(
                                    <li>{b.rewrite} </li>
                                )
                            })}
                            </div>
                        )
                    })}
                </ol>
            </div>
        )
    }

}

export default ModRewrites;