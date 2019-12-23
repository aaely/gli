import React, { Component } from 'react';
import { Form, FormGroup, Col, Row, Label, Input, FormText, Button, Alert } from 'reactstrap';
import Strapi from 'strapi-sdk-javascript/build/main';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class NewMod extends Component {

    constructor(props) {
        super(props);
        let html = '<p>Testing 1234 😀</p>';
        let contentBlock = htmlToDraft(html);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.state = {
                application: [],
                submission: [],
                loadingItems: true,
                editorState,
                uploadedImages: [],
                moddetails: '',
                teststeps: '',
                trackerid: '',
                successMessage: false,
                errorMessage: false
            }
            this._uploadImageCallBack = this._uploadImageCallBack.bind(this);
        }
        this.handleTrackerID = this.handleTrackerID.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    mod (id: "${this.props.match.params.modId}") {
                        title
                        moddetails
                        trackerid
                        teststeps
                        application {
                            _id
                            name
                        }
                        status
                        submissions {
                            _id
                            file
                        }
                  }
                }`
            }
        }
        );
        this.setState({
            application: response.data.mod.application._id,
            submission: response.data.mod.submissions[0].file,
            trackerid: response.data.mod.trackerid,
            moddetails: response.data.mod.moddetails,
            teststeps: response.data.mod.teststeps,
            title: response.data.mod.title,
            loadingItems: false
        });
        if (this.state.moddetails === null && this.state.teststeps !== null){
            this.setState({ moddetails: '<p>Input text here</p>'});}
        if (this.state.teststeps === null) {
                this.setState({ teststeps: '<p>Input Test Steps here</p>'});
            }
        
        let x = this.state.moddetails.replace(/'''/g, '"');
        let y = this.state.teststeps.replace(/'''/g, '"');
        let contentBlock = htmlToDraft(x.replace(/----/g, '\\'));
        let contentBlock1 = htmlToDraft(y.replace(/----/g, '\\'));
        if (contentBlock && contentBlock1) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let contentState1 = ContentState.createFromBlockArray(contentBlock1.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            let editorState1 = EditorState.createWithContent(contentState1);
            this.setState({
                editorState,
                editorState1
            });
        }
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    saveChanges =  async () => {
        try {
            let { application, submission, moddetails, teststeps, trackerid, title, status, errorMessage, successMessage } = this.state;
            moddetails = moddetails.replace(/"/g, '\'\'\'');
            moddetails = moddetails.replace(/\\/g, '----');
            teststeps = teststeps.replace(/"/g, '\'\'\'');
            teststeps = teststeps.replace(/\\/g, '----');
            await strapi.request('POST', 'graphql', {
                data: {
                    query: `mutation {
                        updateMods(input: {
                          where: {
                            id: "${this.props.match.params.modId}"
                          },
                          data: {
                            moddetails: "${moddetails}"
                            teststeps: "${teststeps}"
                            trackerid: "${trackerid}"
                            title: "${title}"
                            status: ${status}
                          }
                        }) {
                          mod {
                            moddetails
                            teststeps
                            trackerid
                            title
                            status
                          }
                        }
                      }`
                }
            });
            this.setState({
                successMessage: true
            })
            setTimeout(() => {this.setState({ successMessage: false })}, 3000);
            this.props.history.goBack();
            }catch (err) {
                console.log(err);
                this.setState({
                    errorMessage: true
                })
                setTimeout(() => {this.setState({ errorMessage: false })}, 3000);
            }
        }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
            html: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
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

    handleTrackerID = (event) => {
        this.setState({
            trackerid: event.target.value
        })
        console.log(this.state);
    }

    handleTitle = (event) => {
        this.setState({
            title: event.target.value
        })
        console.log(this.state);
    }

    handleStatus = (event) => {
        this.setState({
            status: event.target.value
        })
    }


    onModDetailsStateChange = (editorState) => {
        this.setState({
            editorState,
            moddetails: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    onTestStepsStateChange = (editorState1) => {
        this.setState({
            editorState1,
            teststeps: draftToHtml(convertToRaw(editorState1.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    render() {
        let { loadingItems, application, submission, editorState, editorState1, trackerid, title, status, errorMessage, successMessage } = this.state;
        console.log(this.state);
        return(
            <Form style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px'}}>
                <FormGroup row>
                    <Label for="file" sm={2}>Submission File #</Label>
                    <Col sm={10}>
                        <Input type="text" name="file" id="file" value={submission} />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="title" sm={2}>Title</Label>
                    <Col sm={10}>
                        <Input type="text" name="title" id="title" value={title} onChange={this.handleTitle}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="trackerid" sm={2}>Tracker ID</Label>
                    <Col sm={10}>
                        <Input type="trackerid" name="trackerid" id="trackerid" value={trackerid} onChange={this.handleTrackerID}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="exampleSelect" sm={2}>Status</Label>
                    <Col sm={10}>
                        <Input type="select" name="select" id="exampleSelect" value={status} onChange={this.handleStatus}>
                        <option>Testable</option>
                        <option>JIRA</option>
                        <option>Audit</option>
                        <option>Complete</option>
                        <option>Revoked</option>
                        </Input>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Label for="moddetails" sm={2}>Mod Details</Label>
                        <Editor 
                            editorState={editorState}
                            onEditorStateChange={this.onModDetailsStateChange}
                        />  
                </FormGroup>
                <FormGroup>
                    <Label for="teststeps" sm={2}>Test Steps</Label>
                        <Editor 
                            editorState={editorState1}
                            onEditorStateChange={this.onTestStepsStateChange}
                            toolbar={{
                                image: { uploadCallback: this._uploadImageCallBack },
                                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg,application/pdf,text/plain,application/vnd.openxmlformatsofficedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel'
                              }}
                        />
                </FormGroup>
                <FormGroup check row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={this.saveChanges}>Submit</Button>
                    </Col>
                </FormGroup>
                {errorMessage &&
                <Alert color='danger'>Error</Alert>
                }
                {successMessage &&
                <Alert color='success'>Success</Alert>
                }
            </Form>
        );
    }
}

export default NewMod;