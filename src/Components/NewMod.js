import React, { Component } from 'react';
import { Form, FormGroup, Col, Row, Label, Input, FormText, Button } from 'reactstrap';
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
                trackerid: ''
            }
            this._uploadImageCallBack = this._uploadImageCallBack.bind(this);
        }
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id: "${this.props.match.params.submissionId}") {
                    _id
                    file
                    application {
                        _id
                        name
                    }
                  }
                }`
            }
        }
        );
        this.setState({
            submission: response.data.submission,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    saveChanges =  async () => {
        try {
            let { html, application } = this.state;
            html = html.replace(/"/g, '\'\'\'');
            html = html.replace(/\\/g, '----')
            console.log(html);
            await strapi.request('POST', 'graphql', {
                data: {
                    query: `mutation {
                        NewMods(input: {
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
            }catch (err) {
                console.log(err);
            }
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
        });
    }


    onModDetailsStateChange = (editorState) => {
        this.setState({
            editorState,
            moddetails: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
        console.log(this.state);
    }

    onTestStepsStateChange = (editorState1) => {
        this.setState({
            editorState1,
            teststeps: draftToHtml(convertToRaw(editorState1.getCurrentContent())).replace(/[\n]/g, '')
        });
        console.log(this.state);
    }

    render() {
        let { loadingItems, application, submission, editorState, trackerid, editorState1 } = this.state;
        return(
            <Form style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px'}}>
                <FormGroup row>
                    <Label for="file" sm={2}>Submission File #</Label>
                    <Col sm={10}>
                        <Input type="text" name="file" id="file" value={submission.file}/>
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
                        <Input type="select" name="select" id="exampleSelect">
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
                        <Button>Submit</Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

export default NewMod;