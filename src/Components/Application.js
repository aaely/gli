import React, { Component } from 'react';
import Collapsible from 'react-collapsible';
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
import { Alert } from 'reactstrap';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Vendors extends Component {

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
                uploadedImages: [],
                html,
                errorMessage: false,
                successMessage: false
            }
            this._uploadImageCallBack = this._uploadImageCallBack.bind(this);
        }
    }

    async componentDidMount() {
        try {
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
        let x = this.state.application.howto.replace(/'''/g, '"');
        let contentBlock = htmlToDraft(x.replace(/----/g, '\\'));
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.setState({
                editorState,
                html: x.replace(/----/g, '\\')
            });
        }
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    saveChanges = async () => {
        try {
            let { html, application } = this.state;
            html = html.replace(/"/g, '\'\'\'');
            html = html.replace(/\\/g, '----')
            console.log(html);
            await strapi.request('POST', 'graphql', {
                data: {
                    query: `mutation {
                        updateApplication(input: {
                          where: {
                            id: "${application._id}"
                          },
                          data: {
                            howto: "${html}"
                          }
                        }) {
                          application {
                            howto
                          }
                        }
                      }`
                }
            });
            this.setState({
                successMessage: true
            })
            setTimeout(() => {this.setState({ successMessage: false })}, 3000);
            }catch (err) {
                console.log(err);
                this.setState({
                    errorMessage: true
                });
                setTimeout(() => {this.setState({ errorMessage: false })}, 3000);
            }
        }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
            html: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    renderDropDown1() {
        return (
            <span className="trigger">
                Jurisdictions:
            </span>
        );
    }

    renderDropDown2() {
        return (
            <span className="trigger">
                Mods:
            </span>
        );
    }

    renderHide() {
        return (
            <span className="trigger">
                Hide
            </span>
        );
    }

    _uploadImageCallBack = (file) => {
        // long story short, every time we upload an image, we
        // need to save it to the state so we can get it's data
        // later when we decide what to do with it.
    
       // Make sure you have a uploadImages: [] as your default state
        let { uploadedImages } = this.state;
        console.log(uploadedImages);
        const imageObject = {
          file: file,
          localSrc: URL.createObjectURL(file),
          dburl: `${apiUrl}/uploads/${file.name}`
        }

        uploadedImages.push(imageObject);
    
        this.setState({uploadedImages: uploadedImages})
    
        // We need to return a promise with the image src
        // the img src we will use here will be what's needed
        // to preview it in the browser. This will be different than what
        // we will see in the index.md file we generate.
        return new Promise(
          (resolve, reject) => {
            resolve({ data: { link: imageObject.localSrc } });
          }
        );
    }


    render() {
        let { loadingItems, application, submissions, editorState, successMessage, errorMessage } = this.state;
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
                    <h3><strong>Submissions:</strong></h3>
                {submissions.map(a => {
                    return (
                        <p>
                            <Link to={`/submission/${a._id}`}>{a.file}</Link> <br />
                            {application.name}
                            {a.versions.map(b => {
                                return (
                                    <span> {b.version}</span>
                                )
                            })}<br />
                            <Collapsible 
                            transitionTime="250" 
                            trigger={this.renderDropDown1()}
                            triggerWhenOpen={this.renderHide()}
                            >
                                {a.jurisdictions.map(c => {
                                return (
                                    <p>{c.jurisdiction} -- Status: {c.approvalstatuses.map(d => {
                                        return (
                                            <span>{d.status}</span>
                                        )
                                        })}   </p>
                                    )
                                })}
                            </Collapsible>
                        </p>
                    )
                })}
                <Editor 
                    editorState={editorState}
                    onEditorStateChange={this.onEditorStateChange}
                    toolbar={{
                        image: { uploadCallback: this._uploadImageCallBack },
                        inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg,application/pdf,text/plain,application/vnd.openxmlformatsofficedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel'
                        }}
                    />
                <button style={{backgroundColor: 'black',color: 'green', borderRadius: '20px'}} onClick={this.saveChanges}>Save</button> <br />
                {successMessage && 
                <Alert color='success'>Successfully Saved!</Alert>
                }
                {errorMessage &&
                <Alert color='danger' style={{padding: '20px'}}>There was an issue saving to database</Alert>
                }
                </Box>
            </Box>
            </Box>
            {loadingItems && <Loader />}
            </Container>
        );
    }
}

export default Vendors;