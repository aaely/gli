import React, { Component } from 'react';
import { Form, FormGroup, Label, Input, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { FaEdit, FaFileUpload } from 'react-icons/fa';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);

class ModTestPlan extends Component {

    constructor(props) {
        super(props);
        let html = '<p>Testing 1234 😀</p>';
        let contentBlock = htmlToDraft(html);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.state = {
                loadingItems: true,
                submission: '',
                jurisdictions: [],
                vendor: '',
                vendorId: '',
                mods: [],
                application: [],
                versions: [],
                html: '',
                editorState,
                rewrite: '',
                results: '',
                name: '',
                testingdate: Date,
                previousversion: ''
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
                      urns {
                          _id
                          url
                      }
                      application {
                          _id
                          name
                      }
                      versions {
                          _id
                          version
                          mods {
                            _id
                            modnumber
                            title
                            trackerid
                            moddetails
                            status
                            jira
                            teststeps
                            sidenotes
                            rewrite
                            results
                            versionaffected
                            testingzip {
                                _id
                                url
                            }
                            employee {
                                _id
                                fname
                                lname
                            }
                        }
                      }
                  }
                }`
            }
        }
        );
        let getMods = response.data.submission.versions.sort((a, b) => (b.version.localeCompare(a.version))).map(a => {return a.mods.sort((a, b) => (a.modnumber - b.modnumber))});
        let ModsList = [];
        for (let i = 0; i < getMods.length; i++){
            let j = 0;
            while (j < getMods[i].length) {
                ModsList.push(getMods[i][j])
                j++
            }
        }
        this.setState({
            submission: response.data.submission.file,
            loadingItems: false,
            mods: ModsList,
            application: response.data.submission.application,
            versions: response.data.submission.versions[0].version,
            modsCount: ModsList.length,
            previousversion: response.data.submission.application.name
        });

        console.log(this.state);
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
            html: draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/[\n]/g, '')
        });
    }

    renderInitialTable() {
        let { submission, versions, application, mods, name, previousversion } = this.state;
        return (
            <Table>
                <tbody>
                    <tr>
                        <td>
                            Engineer Name: 
                        </td>
                        <td>
                            <Input style={{textAlign: 'center'}} type='text' id='name' name='name' value={name} onChange={this.handleNameChange.bind(this)}/>
                        </td>
                        <td>
                            Date:
                        </td>
                        <td>
                            <Input style={{textAlign: 'center'}} type='date' id='testingdate' name='testingdate' onChange={this.handleDateChange.bind(this)} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            File Number:
                        </td>
                        <td>
                            <span>{submission}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Current Software Version:
                        </td>
                        <td>
                            <span>{application.name} {versions}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Previous Software Version:
                        </td>
                        <td>
                            <Input style={{textAlign: 'center'}} type='text' name='previousversion' id='previousversion' value={previousversion} onChange={this.handleVersionChange.bind(this)}/>
                        </td>
                        <td>
                            Previous File #:
                        </td>
                        <td>
                            <Input style={{textAlign: 'center'}} type='text' name='previousfile' id='previousfile' />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Total # of Modifications:
                        </td>
                        <td>
                            {mods.length}
                        </td>
                    </tr>
                </tbody>
            </Table>
        )
    }

    renderModTestPlan() {
        let { mods, name, testingdate } = this.state;
        return (
        mods.map((x, index) => {
        return (
            <div className="card" key={x._id} style={{marginTop: '30px', marginBottom: '30px', backgroundColor: '#ccc', display: 'block'}}>
                <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                <Link to={`/updatemod/${x._id}`}>
                    <FaEdit size={30} style={{marginTop:'5px', marginBottom: '5px'}}/>
                </Link>
                </div>
                <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                    <a href={`${apiUrl}/admin/plugins/content-manager/mods/${x._id}?redirectUrl=/plugins/content-manager/mods?_limit=10&_page=1&_sort=_id&_q=abc&source=content-manager`} >
                        <FaFileUpload size={30} style={{marginTop:'5px', marginBottom: '5px'}}/>
                    </a>
                </div>
                {/*<Link to={`/submission/${this.props.match.params.submissionId}`} onClick={this.deleteMod(x._id)} style={{backgroundColor: '#333'}}>
                    <FaTrash size={20}/>
                </Link>*/}
                <h5>Mod Number: {index + 1}</h5>
                <h5>Tracker ID: {x.trackerid}</h5>
                <h5>Version Affected: {x.versionaffected}</h5>
                {x.status === 'Revoked' &&
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}>
                <h5>Revoked:</h5>
                <Form>
                <FormGroup check inline>
                <Label check>
                  <Input type="radio" name="radio1" defaultChecked />{' '}
                  Yes
                </Label>
                </FormGroup>
                <FormGroup check inline>
                <Label check>
                    <Input type="radio" name="radio1" />{' '}
                    No
                    </Label>
                </FormGroup>
                </Form>
                </p>
                }
                {x.status !== 'Revoked' &&
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}>
                <h5>Revoked:</h5>
                <Form>
                <FormGroup check inline>
                <Label check>
                  <Input type="radio" name="radio1" />{' '}
                  Yes
                </Label>
                </FormGroup>
                <FormGroup check inline>
                <Label check>
                    <Input type="radio" name="radio1" defaultChecked />{' '}
                    No
                    </Label>
                </FormGroup>
                </Form>
                </p>
                }
                {x.jira != null && x.jira !== '' &&
                    <h5>
                        <a href={x.jira} style={{backgroundColor: 'black', color: 'red'}}>Jira</a>
                    </h5>
                }
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px', marginTop: '5px', marginBottom: '5px'}}><h5>Mod Details:</h5><br />
                <h5 style={{color: '#007bff'}}>{x.title}</h5>
                <Editor
                editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                readOnly='true'
                toolbarHidden='true'
                /></p>
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px', marginTop: '5px', marginBottom: '5px'}}><h5>Test Steps:</h5><br />
                {x.teststeps != null && 
                <Editor 
                editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                readOnly='true'
                toolbarHidden='true'
                />
                }
                {x.teststeps === null && 
                <Editor 
                editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft('<p>Please enter test steps</p>').contentBlocks))}
                readOnly='true'
                toolbarHidden='true'
                />
                }
                </p>
                {x.status !== 'Revoked' && x.status !== 'Complete' &&
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}><h5>Testing results:</h5>TBD <br />{x.testingzip != null &&
                    <h5>
                        <a href={`${apiUrl}${x.testingzip.url}`} style={{marginTop: '5px', marginBottom: '5px', backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                    </h5>
                }</p>
                }
                {x.status === 'Complete' &&
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}><h5>Testing results:</h5>Performed as expected<br />{x.testingzip != null &&
                    <h5>
                        <a href={`${apiUrl}${x.testingzip.url}`} style={{marginTop: '5px', marginBottom: '5px', backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                    </h5>
                }</p>
                }
                {x.status === 'Revoked' &&
                <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}><h5>Testing results:</h5><br />N/A</p>
                }
                {x.rewrite != null && x.rewrite !== '' &&
                    <p style={{borderRadius: '10px', borderStyle: 'solid', borderWidth: '3px'}}>
                        <strong>Rewrite:</strong> {x.rewrite}
                    </p>
                }
                <span><h5>Tested By: {'\u00A0'}</h5>{name}</span>    
                <span><h5>Date Tested: {'\u00A0'}</h5>{testingdate}</span>
                {x.status === 'Revoked' &&
                <span><h5>Pass/Fail: {'\u00A0'}</h5>N/A</span>
                }
                {x.status === 'Complete' &&
                <span><h5>Pass/Fail: {'\u00A0'}</h5>PASS</span>
                }
            </div>
            );}
        ))
    }

    handleNameChange = (event) => {
        this.setState({
            name: event.target.value
        })
    }

    handleDateChange = (event) => {
        this.setState({
            testingdate: event.target.value
        })
    }

    handleVersionChange = (event) => {
        this.setState({
            previousversion: event.target.value
        })
    }

    render () {
        let { loadingItems, submission } = this.state;
        return (
            <div style={{textAlign: 'center'}}>
                <h1 style={{marginTop:'20px', marginBottom: '20px'}}>System Modification Test Plan Form <br /><em>FM-EN-454</em></h1>
                {this.renderInitialTable()}
                <br />
                <h5>GPS link for all mods:</h5>
                <p><strong><u>{`\\\\gaminglabs.net\\glimain\\Public\\LV\\Submissions\\2019\\SDS\\${submission}\\GLI Created\\10 Systems and Kiosks\\02 Reports`}</u></strong></p>
                {this.renderModTestPlan()}
                <div className="fixed-action-btn">
                    <Link style={{backgroundColor: '#333', marginRight: '20px'}} className="btn-floating btn-large right" to={`/newmod/${this.props.match.params.submissionId}`}>
                        <i class="material-icons" style={{color: 'hsl(128, 100%, 50%)'}}>add</i>
                    </Link>
                </div>
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default ModTestPlan;