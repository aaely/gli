import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class NewSub extends Component {

    constructor(props){
        super(props);
        this.state = {
            applications: [],
            loadingItems: true
        }
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    applications {
                    _id
                    name
                  }
                }`
            }
        }
        );
        this.setState({
            applications: response.data.applications,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { applications } = this.state;
        return(
            <div>
                <h3 style={{textAlign: 'center'}}>Which Application is the Submission for?</h3>
                {applications.map(a => {
                    return(
                        <p style={{textAlign: 'center', marginTop: '30px'}}><Link to={`/newsubmission/${a._id}`}>{a.name}</Link></p>
                    )
                })}
            </div>
        )
    }
}

export default NewSub;