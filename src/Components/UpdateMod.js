import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Form, Input, Button, Label, FormGroup, FormText, Col, Row } from 'reactstrap';
import Loader from './Loader';
import Strapi from 'strapi-sdk-javascript/build/main';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { FaTrash, FaCheck } from 'react-icons/fa';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class UpdateMod extends Component {

    constructor(props) {
        super(props);
        let moddetails = '';
        let contentBlock = htmlToDraft(moddetails);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            let editorState1 = EditorState.createWithContent(contentState);
            this.state = {
                editorState,
                editorState1,
                uploadedImages: [],
                moddetails: '',
                teststeps: '',
                trackerID: '',
                status: null,
                rewrite: '',
                title: '',
                modnumber: 0,
                submission: '',
                app: '',
                appId: '',
                version: '',
                subId: '',
                sidenotes: '',
                testingzip: [],
                versionaffected: '',
                loadingItems: true,
                jira: '',
                versions: '',
                showinitialversion: true,
                isaudit: false
            }
        }
    }

    async componentDidMount() {
        try {
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    mod (id : "${this.props.match.params.modId}") {
                      title
                      moddetails
                      teststeps
                      modnumber
                      trackerid
                      status
                      rewrite
                      sidenotes
                      isaudit
                      jira
                      versionaffected
                      versions {
                          _id
                      }
                      submissions {
                          _id
                          file
                          versions {
                              _id
                              version
                          }
                      }
                      application {
                          _id
                          name
                      }
                  }
                }`
            }
        }
        );
        let initialversion = response.data.mod.submissions[0].versions.filter(prop => {
            return prop._id.toLowerCase().includes(`${response.data.mod.versions[0]._id}`);
        })
        console.log(initialversion);
        this.setState({
            moddetails: response.data.mod.moddetails,
            teststeps: response.data.mod.teststeps,
            trackerID: response.data.mod.trackerid,
            status: response.data.mod.status,
            rewrite: response.data.mod.rewrite,
            title: response.data.mod.title,
            modnumber: response.data.mod.modnumber,
            submission: response.data.mod.submissions[0].file,
            app: response.data.mod.application.name,
            appId: response.data.mod.application._id,
            version: response.data.mod.versions[0]._id,
            subId: response.data.mod.submissions[0]._id,
            sidenotes: response.data.mod.sidenotes,
            versionaffected: response.data.mod.versionaffected,
            loadingItems: false,
            jira: response.data.mod.jira,
            versions: response.data.mod.submissions[0].versions,
            initialversion: initialversion[0].version,
            isaudit: response.data.mod.isaudit
        });
        if (this.state.teststeps === null) {
            this.setState({
                teststeps: '<p>Input test steps here</p>'
            })
        }
        if (this.state.moddetails === null) {
            this.setState({
                moddetails: '<p>Input test mod details here</p>'
            })
        }
        if (this.state.jira === null || this.state.jira === '') {
            this.setState({
                jira: 'https://tracker.gaminglabs.com:8443/browse/'
            })
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
            });}
        }catch (err) {
            console.log(err);
            this.setState({
                loadingItems: false
            })
        }
    }

    handleTrackerIDChange = (event) => {
        this.setState({
            trackerID: event.target.value
        })
        console.log(this.state);
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

    handleSidenotesChange = (event) => {
        this.setState({
            sidenotes: event.target.value
        })
    }

    handleTestingzip = (event) => {
        this.setState({
            testingzip: event.target.value
        })
    }

    handleJiraChange = (event) => {
        this.setState({
            jira: event.target.value
        })
    }

    handleVersionChange = (event) => {
        this.setState({
            versionaffected: event.target.value
        })
    }

    handleIsAuditChange = (event) => {
        this.setState({
            isaudit: !this.state.isaudit
        })
    }

    handleVersionsChange = (event) => {
        let ver = this.state.versions.filter(prop => {
            return prop.version.toLowerCase().includes(`${event.target.value}`.toLowerCase())
        });
        if (this.state.showinitialversion === true) {
            this.setState({
                showinitialversion: false
            })
        }
        this.setState({
            version: ver[0]._id
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
            let { isaudit, jira, versionaffected, sidenotes, appId, moddetails, teststeps, trackerID, status, rewrite, title, version, modnumber, subId } = this.state;
            if (sidenotes === null) {
                this.setState({
                    sidenotes: ''
                })
            }
            if (rewrite === null) {
                this.setState({
                    rewrite: ''
                })
            }
            if (jira == "https://tracker.gaminglabs.com:8443/browse/") {
                jira = '';
                console.log(jira);
            }
            moddetails = moddetails.replace(/"/g, '\'\'\'');
            moddetails = moddetails.replace(/\\/g, '----');
            teststeps = teststeps.replace(/"/g, '\'\'\'');
            teststeps = teststeps.replace(/\\/g, '----');
            await strapi.request('POST', '/graphql', {
                data: {
                    query: `mutation {
                        updateMods(input: {
                          where: {
                              id: "${this.props.match.params.modId}"
                          }
                          data: {
                            title: "${title}",
                            trackerid: "${trackerID}",
                            status: ${status},
                            modnumber: ${modnumber},
                            teststeps: "${teststeps}",
                            moddetails: "${moddetails}",
                            rewrite: "${rewrite}",
                            application: "${appId}",
                            submissions: "${this.props.match.params.submissionId}",
                            versions: "${version}",
                            sidenotes: "${sidenotes}",
                            versionaffected: "${versionaffected}",
                            jira: "${jira}",
                            isaudit: ${isaudit}
                          }
                        }) {
                          mod {
                            title
                            trackerid
                            status
                            jira
                            modnumber
                            teststeps
                            moddetails
                            rewrite
                            sidenotes
                            isaudit
                          }
                        }
                      }`
                }
            });
            console.log('success!');
            this.props.history.goBack();
        } catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    deleteMod = async () => {
        try {
            let { subId } = this.state;
            await strapi.request('POST', '/graphql', {
                data: {
                    query: `mutation {
                        deleteMods(input: {
                          where: {
                            id: "${this.props.match.params.modId}"
                          }
                        }) {
                          mod {
                            title
                            trackerid
                          }
                        }
                      }`
                }
            });
            this.props.history.push(`/submission/${subId}`);
        } catch (err) {
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

    render() {
        let { isaudit, initialversion, showinitialversion, versions, loadingItems, versionaffected, version, testingzip, submission, app, editorState, editorState1, jira, title, trackerID, modnumber, rewrite, sidenotes, status } = this.state;
        console.log(this.state);
        return(
            <div>
                <h3 style={{marginTop: '20px', marginBottom: '20px', textAlign: 'center'}}>{app}</h3>
                <h3 style={{marginTop: '20px', marginBottom: '20px', textAlign: 'center'}}>{submission}</h3>
                {!loadingItems &&
                <Form style={{marginTop: '20px', marginLeft: '20px', marginRight: '20px'}}>
                    <FormGroup row>
                        <Label for="fileNumber" sm={2}>Submission #</Label>
                        <Col sm={10}>
                        <Input type="text" name="file" id="file" value={`${submission}`} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="modTitle" sm={2}>Mod Title</Label>
                        <Col sm={10}>
                        <Input type="text" name="title" id="title" onChange={this.handleTitleChange.bind(this)} value={title}/>
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
                        <Input type="text" name="trackerid" id="trackerid" placeholder="EBS-555" onChange={this.handleTrackerIDChange.bind(this)} value={trackerID}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="modnumber" sm={2}>Mod Number</Label>
                        <Col sm={10}>
                        <Input type="number" name="modnumber" id="modnumber" placeholder="1" onChange={this.handleModNumberChange.bind(this)} value={modnumber}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Status</Label>
                        <Col sm={10}>
                        <Input type="select" name="select" id="exampleSelect" onChange={this.handleStatusChange} value={status}>
                            <option>Testable</option>
                            <option>Audit</option>
                            <option>JIRA</option>
                            <option>Complete</option>
                            <option>Revoked</option>
                        </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="isaudit" sm={2}>Audited?</Label>
                        <Col sm={{ size: 10 }}>
                        <FormGroup check>
                            <Label check>
                            <Input type="checkbox" id="isaudit" onChange={this.handleIsAuditChange} checked={isaudit} />{' '}
                            Check if audit
                            </Label>
                        </FormGroup>
                        </Col>
                    </FormGroup>
                    {showinitialversion === true && 
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Version</Label>
                        <Col sm={10}>
                        <Input type="select" name="versions" id="versions" onChange={this.handleVersionsChange} value={initialversion} >
                           {versions.map(a => {
                               return(
                                   <option>{a.version}</option>
                               )
                           })} 
                        </Input>
                        </Col>
                    </FormGroup>}
                    {showinitialversion === false && 
                    <FormGroup row>
                        <Label for="statusSelect" sm={2}>Version</Label>
                        <Col sm={10}>
                        <Input type="select" name="versions" id="versions" onChange={this.handleVersionsChange} >
                           {versions.map(a => {
                               return(
                                   <option>{a.version}</option>
                               )
                           })} 
                        </Input>
                        </Col>
                    </FormGroup>}
                    <FormGroup row>
                        <Label for="trackerID" sm={2}>JIRA</Label>
                        <Col sm={10}>
                        <Input type="text" name="jira" id="jira" placeholder="https://tracker.gaminglabs.com:8443/browse" onChange={this.handleJiraChange.bind(this)} value={jira}/>
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
                        <Input type="textarea" name="rewrite" id="rewrite" onChange={this.handleRewriteChange.bind(this)} value={rewrite}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="exampleText">Side Notes</Label>
                        <Input type="text" name="sidenotes" id="sidenotes" onChange={this.handleSidenotesChange.bind(this)} value={sidenotes}/>
                    </FormGroup>
                    <FormGroup check row>
                        <Col sm={{ size: 10, offset: 2 }}>
                        <Button style ={{marginRight: '10px'}} color='success' onClick={this.saveMod}><FaCheck /></Button>
                        <Button style ={{marginLeft: '10px'}} color='danger' onClick={this.deleteMod}><FaTrash /></Button>
                        </Col>
                    </FormGroup>
                </Form>}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default UpdateMod;