import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Props extends Component {
    state = {
        searchTerm: '',
        loadingItems: true,
        property: [],
        applications: []
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    property (id: "${this.props.match.params.propertyId}")  {
                    _id
                    name
                    applications {
                      name
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            property: response.data.property.name,
            applications: response.data.property.applications,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { property, applications, loadingItems } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                <h1>Property</h1> <br />
                <h4>{property}</h4> <br />
                <h3>Applications used by Property</h3>
                {applications.map(app => {
                    return(
                        <div>
                            {app.name}
                        </div>
                    );
                })}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Props;