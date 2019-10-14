import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://192.168.0.178:1337';
const strapi = new Strapi(apiUrl);

class Manufacturer extends Component {
    state = {
        loadingItems: true,
        submission: '',
        jurisdictions: [],
        vendor: '',
        vendorId: ''
    }

    async componentDidMount() {
        try {
            console.log(this.props.match.params.submissionId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id : "${this.props.match.params.submissionId}") {
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
                      }
                  }
                }`
            }
        }
        );
        this.setState({
            submission: response.data.submission.file,
            vendor: response.data.submission.vendor.name,
            jurisdictions: response.data.submission.jurisdictions,
            loadingItems: false,
            vendorId: response.data.submission.vendor._id
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    render() {
        let { submission, vendor, jurisdictions, loadingItems, vendorId } = this.state;
        console.log(this.state);
        return(
            <div>
                <h1 style={{textAlign: 'center'}}>{submission}</h1>
                <Link to={`/vendors/${vendorId}`}><h3 style={{textAlign: 'center'}}>{vendor}</h3></Link>
                <h3>
                    Jurisdictions this file is submitted for:
                </h3>
                {jurisdictions.map(jurs => {
                    return(
                        <div>
                           <Link to={`/jurisdiction/${jurs._id}`}>{jurs.jurisdiction}</Link>
                        </div>
                    );
                })} 
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Manufacturer;