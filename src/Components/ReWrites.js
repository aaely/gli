import React, { Component } from 'react';
import Loader from './Loader';
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class ReWrites extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingItems: true,
            versions: []
        }
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id : "${this.props.match.params.submissionId}") {
                      versions {
                          _id
                          version
                          mods {
                            _id
                            modnumber
                            rewrite
                        }
                      }
                  }
                }`
            }
        }
        );
        this.setState({
            loadingItems: false,
            versions: response.data.submission.versions.sort((a, b) => (b.version.localeCompare(a.version))),
        });
        console.log(this.state);
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { versions } = this.state;
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

export default ReWrites;