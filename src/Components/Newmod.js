import React, { Component } from 'react';
import { Form, Input, Button, Label, FormGroup, FormText, Col, Row } from 'reactstrap';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Redirect from 'react-router-dom';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class Newmod extends Component {

    constructor(props) {
        super(props);
        let moddetails = '';
        let contentBlock = htmlToDraft(moddetails);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            let editorState1 = EditorState.createWithContent(contentState);
            this.state = {
                loadingItems: true,
                mods: [],
                file: '',
                appId: '',
                editorState,
                editorState1,
                uploadedImages: [],
                moddetails: '<p>Insert mod details here</p>',
                teststeps: '<p>Insert test steps here</p>',
                trackerID: '',
                status: 'Testable',
                rewrite: '',
                title: '',
                versions: [],
                modnumber: 0,
                jira: null,
                sidenotes: '',
                versionaffected: '',
                version: ''
            }
        }
    }

    async componentDidMount() {
        try {
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id : "${this.props.match.params.submissionId}") {
                      file
                      application {
                          _id
                          name
                      }
                      versions {
                          _id
                          version
                      }
                  }
                }`
            }
        }
        );
        this.setState({
            loadingItems: false,
            mods: response.data.submission.mods,
            file: response.data.submission.file,
            appId: response.data.submission.application._id,
            app: response.data.submission.application.name,
            versions: response.data.submission.versions,
            version: response.data.submission.versions[0]._id
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    handleTrackerIDChange = (event) => {
        this.setState({
            trackerID: event.target.value
        })
    }

    handleStatusChange = (event) => {
        this.setState({
            status: event.target.value
        })
    }

    handleRewriteChange = (event) => {
        this.setState({
            rewrite: event.target.value
        })
    }

    handleTitleChange = (event) => {
        this.setState({
            title: event.target.value
        })
    }

    handleModNumberChange = (event) => {
        this.setState({
            modnumber: event.target.value
        })
    }

    handleVersionChange = (event) => {
        this.setState({
            versionaffected: event.target.value
        })
    }

    handleVersionsChange = (event) => {
        let ver = this.state.versions.filter(prop => {
            return prop.version.toLowerCase().includes(`${event.target.value}`.toLowerCase())
        });
        console.log(ver);
        this.setState({
            version: ver[0]._id
        })
    }

    handleSidenotesChange = (event) => {
        this.setState({
            sidenotes: event.target.value
        })
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
            moddetails: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    onEditorStateChange1 = (editorState1) => {
        this.setState({
            editorState1,
            teststeps: draftToHtml(convertToRaw(editorState1.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    saveMod = async () => {
        try {
            let { versionaffected, appId, moddetails, teststeps, trackerID, status, rewrite, title, version, modnumber, jira, sidenotes } = this.state;
            
            moddetails = moddetails.replace(/"/g, '\'\'\'');
            moddetails = moddetails.replace(/\\/g, '----');
            teststeps = teststeps.replace(/"/g, '\'\'\'');
            teststeps = teststeps.replace(/\\/g, '----');
            let response = await strapi.request('POST', 'graphql', {
                data: {
                    query: `mutation {
                        createMods(input: {
                          data: {
                            title: "${title}",
                            trackerid: "${trackerID}",
                            status: ${status},
                            jira: ${jira},
                            modnumber: ${modnumber},
                            teststeps: "${teststeps}",
                            moddetails: "${moddetails}",
                            rewrite: "${rewrite}",
                            application: "${appId}",
                            submissions: "${this.props.match.params.submissionId}",
                            versions: "${version}",
                            sidenotes: "${sidenotes}",
                            versionaffected: "${versionaffected}"
                          }
                        }) {
                          mod {
                            _id
                            title
                            trackerid
                            status
                            jira
                            modnumber
                            teststeps
                            moddetails
                            rewrite
                            sidenotes
                          }
                        }
                      }`
                }
            });
            console.log(response);
            this.props.history.push(`/submission/${this.props.match.params.submissionId}`);
        } catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
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

    render() {
        let { versionaffected, loadingItems, file, app, editorState, editorState1, versions, title, trackerid, sidenotes, rewrite, modnumber } = this.state;
        console.log(this.state);
        return(
            <div>
                <h3 style={{marginTop: '20px', marginBottom: '20px', textAlign: 'center'}}>{app}</h3>
                <h3 style={{marginTop: '20px', marginBottom: '20px', textAlign: 'center'}}>{file}</h3>
                {!loadingItems &&
                <Form style={{marginTop: '20px', marginLeft: '20px', marginRight: '20px'}}>
                    <FormGroup row>
                        <Label for="fileNumber" sm={2}>Submission #</Label>
                        <Col sm={10}>
                        <Input type="text" name="file" id="file" value={`${file}`} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="modTitle" sm={2}>Mod Title</Label>
                        <Col sm={10}>
                        <Input type="text" name="title" id="title" onChange={this.handleTitleChange} vlaue={title} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="versionaffected" sm={2}>Version Affected</Label>
                        <Col sm={10}>
                        <Input type="text" name="versionaffected" id="versionaffected" onChange={this.handleVersionChange.bind(this)} value={versionaffected}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="trackerID" sm={2}>Tracker ID</Label>
                        <Col sm={10}>
                        <Input type="text" name="trackerid" id="trackerid" placeholder="EBS-555" onChange={this.handleTrackerIDChange.bind(this)} value={trackerid} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="modnumber" sm={2}>Mod Number</Label>
                        <Col sm={10}>
                        <Input type="number" name="modnumber" id="modnumber" placeholder="1" onChange={this.handleModNumberChange.bind(this)} value={modnumber} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Status</Label>
                        <Col sm={10}>
                        <Input type="select" name="status" id="status" onChange={this.handleStatusChange}>
                            <option>Testable</option>
                            <option>Audit</option>
                            <option>JIRA</option>
                            <option>Complete</option>
                            <option>Revoked</option>
                        </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Version</Label>
                        <Col sm={10}>
                        <Input type="select" name="versions" id="version" onChange={this.handleVersionsChange}>
                           {versions.map(a => {
                               return(
                                   <option>{a.version}</option>
                               )
                           })} 
                        </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="exampleText" sm={2}>Mod Wording</Label>
                        <Col sm={10}>
                        <Editor 
                        editorStyle={{borderStyle: 'solid', borderWidth: '2px', borderColor: '#ddd'}}
                        editorState={editorState}
                        onEditorStateChange={this.onEditorStateChange}
                        toolbar={{
                            image: { uploadCallback: this._uploadImageCallBack },
                            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg,application/pdf,text/plain,application/vnd.openxmlformatsofficedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel'
                            }}
                        />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="exampleText" sm={2}>Test Steps</Label>
                        <Col sm={10}>
                        <Editor
                        editorStyle={{borderStyle: 'solid', borderWidth: '2px', borderColor: '#ddd'}}
                        editorState={editorState1}
                        onEditorStateChange={this.onEditorStateChange1}
                        toolbar={{
                            image: { uploadCallback: this._uploadImageCallBack },
                            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg,application/pdf,text/plain,application/vnd.openxmlformatsofficedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel'
                            }}
                        />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Label for="exampleText">Mod Rewrite</Label>
                        <Input type="textarea" name="text" id="exampleText" onChange={this.handleRewriteChange} value={rewrite} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="exampleText">Side Notes</Label>
                        <Input type="text" name="sidenotes" id="sidenotes" onChange={this.handleSidenotesChange} value={sidenotes} />
                    </FormGroup>
                    <FormGroup check row>
                        <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={this.saveMod}>Submit</Button>
                        </Col>
                    </FormGroup>
                </Form>}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Newmod;