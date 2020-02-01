import React, { Component } from 'react';
import { Button, Form, Input, Label, FormGroup, Col, Row } from 'reactstrap';
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class NewSubmission extends Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
                application: this.props.match.params.applicationId,
                loadingItems: true,
                file: '',
                version: '',
                status: '',
                activeTab: 1,
                versionCreated: false,
                vendors: []
            }
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    application (id : "${this.props.match.params.applicationId}") {
                        vendors {
                        _id
                      }
                  }
                }`
            }
        }
        );
        this.setState({
            vendors: response.data.application.vendors._id,
        });
        console.log(this.state.vendors);
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
          this.setState({
            activeTab: tab
          });
        }
      }

    handleVersionChange = (event) => {
        this.setState({
            version: event.target.value
        })
    }

    handleFileChange = (event) => {
        this.setState({
            file: event.target.value
        })
    }

    handleStatusChange = (event) => {
        this.setState({
            status: event.target.value
        })
    }

    createVersion = async () => {
        try {
            let { version, application } = this.state;
            let response = await strapi.request('POST', '/graphql', {
                data: {
                    query: `mutation {
                        createVersions(input: {
                            data: {
                                version: "${version}"
                                application: "${application}"
                            }
                        }) {
                        version {
                            _id
                            version
                            application {
                                _id
                            }
                            }
                        }
                    }`
                }
            });
            this.setState({
                version: response.data.createVersions.version._id,
                versionCreated: true,
                activeTab: 2
            });
        } catch(err) {
            console.log(err);
            this.setState({
                loadingItems: false
            })
        }
    }

    createSubmission = async () => {
        try {
            let { file, application,  status, version, vendors } = this.state;
            let response = await strapi.request('POST', 'graphql', {
                data: {
                    query: `mutation {
                        createSubmissions(input: {
                          data: {
                            file: "${file}",
                            application: "${application}",
                            versions: "${version}",
                            vendor: "${vendors}"
                          }
                        }) {
                          submission {
                            _id
                            file
                            status
                            application {
                                _id
                            }
                            versions {
                                _id
                            }
                          }
                        }
                      }`
                }
            });
            this.props.history.push(`/submission/${response.data.createSubmissions.submission._id}`);
        } catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    renderVersionForm() {
        let { application, version } = this.state;
        return(
            <div>
                <h3 style={{textAlign: 'center'}}>Please enter the version number. It cannot be an empty value or this will break.</h3>
                <Form style={{marginTop: '40px', marginLeft: '20px', marginRight: '20px'}}>
                    <FormGroup row>
                        <Label for="modTitle" sm={2}>Version</Label>
                        <Col sm={10}>
                        <Input type="text" name="title" id="title" onChange={this.handleVersionChange} value={version} />
                        </Col>
                    </FormGroup>
                    {version !== null && version !== '' && 
                    <FormGroup check row>
                        <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={this.createVersion}>Submit</Button>
                        </Col>
                    </FormGroup>}
                </Form>
            </div>
        )
    }

    renderSubmissionForm() {
        let { file, status } = this.state;
        return(
            <div>
                <Form style={{marginTop: '20px', marginLeft: '20px', marginRight: '20px'}}>
                    <FormGroup row>
                        <Label for="fileNumber" sm={2}>Submission #</Label>
                        <Col sm={10}>
                        <Input type="text" name="file" id="file" value={`${file}`} onChange={this.handleFileChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Status</Label>
                        <Col sm={10}>
                        <Input type="select" name="select" id="exampleSelect" onChange={this.handleStatusChange} value={status}>
                            <option>In Testing</option>
                        </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup check row>
                        <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={this.createSubmission}>Submit</Button>
                        </Col>
                    </FormGroup>
                </Form>}
            </div>
        )
    }

    render() {
        let { activeTab, versionCreated } = this.state;
        return (
            <div>
                {activeTab === 1 &&
                this.renderVersionForm()
                }
                {activeTab === 2 && versionCreated === true &&
                this.renderSubmissionForm()
                }
            </div>
        )
    }
}

export default NewSubmission;