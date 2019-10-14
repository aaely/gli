import React, { Component } from 'react';
import { Box,
    Heading,
    Text,
    Image,
    Mask,
    Card,
    Button,
    Container, 
    IconButton} from 'gestalt';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
const apiUrl = process.env.API_URL || 'http://192.168.0.178:1337';
const strapi = new Strapi(apiUrl);

class Vendors extends Component {
    /*state = {
        application: [],
        submissions: [],
        loadingItems: true,
        EditorState,
        ContentState
    }*/

    constructor(props) {
        super(props);
        let html = '<p>Testing 1234 😀</p>';
        let contentBlock = htmlToDraft(html);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.state = {
                application: [],
                submissions: [],
                loadingItems: true,
                editorState,
                uploadData: ''
            }
        }
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    application (id: "${this.props.match.params.applicationId}") {
                    _id
                    name
                    howto
                    submissions {
                        _id
                        file
                        versions {
                            _id
                            version
                        }
                        jurisdictions {
                            _id
                            jurisdiction
                            approvalstatuses {
                                _id
                                status
                            }
                        }
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            application: response.data.application,
            submissions: response.data.application.submissions,
            loadingItems: false
        });
        let contentBlock = htmlToDraft(this.state.application.howto);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.setState({
                editorState
            });
        }
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    async saveChanges() {
        try {
            await strapi.request('PUT', 'graphql', {
                data: {
                    mutation: `mutation {
                        updateApplication(input: {
                          where: {
                            id: "5bc18fb154e4a664b438c9b4"
                          },
                          data: {
                            howto: "testing 123"
                        }) {
                          application {
                            howto
                          }
                        }
                      }`
                }
            });
            }catch (err) {
                console.log(err);
            }
        }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState
        });
    }

    render() {
        let { loadingItems, application, submissions, editorState } = this.state;
        console.log(this.state);
        return(
            <Container>
            <Box
            marginTop={5}
            display="flex"
            justifyContent="center"
            alignItems="start"
            dangerouslySetInlineStyle={{
                __style: {
                    flexWrap: "wrap-reverse"
                }
            }}
            >
            <Box display="flex" direction="column" alignItems="center">
                <Box marginBottom={5}>
                    <Heading color="blue">{application.name}</Heading>
                    <Editor 
                    editorState={editorState}
                    onEditorStateChange={this.onEditorStateChange}
                    />
                    <textarea
                        enabled
                        value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                    />
                    <button style={{color: 'black'}} onClick={this.saveChanges}>Save</button>
                    <Link to={`/application/${this.props.match.params.applicationId}/howto`}>Test</Link>
                {submissions.map(a => {
                    return (
                        <p>
                            {a.file} <br />
                            {a.versions.map(b => {
                                return (
                                    <span>{b.version}</span>
                                )
                            })}<br />
                            {a.jurisdictions.map(c => {
                                return (
                                    <p>{c.jurisdiction} -- Status: {c.approvalstatuses.map(d => {
                                        return (
                                            <span>{d.status}</span>
                                        )
                                    })}   </p>
                                )
                            })}
                        </p>
                    )
                })}

                </Box>
            </Box>
            </Box>
            {loadingItems && <Loader />}
            </Container>
        );
    }
}

export default Vendors;