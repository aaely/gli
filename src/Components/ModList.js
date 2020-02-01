import React, { Component } from 'react';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import { Alert } from 'reactstrap';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Collapsible from 'react-collapsible';
import { FaEdit, FaFileUpload, FaTrash, FaSearchDollar } from 'react-icons/fa';
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';const strapi = new Strapi(apiUrl);

class ModList extends Component {

    constructor(props) {
        super(props);
        console.log(this.props);
        let html = '<p>Testing 1234 😀</p>';
        let contentBlock = htmlToDraft(html);
        if (contentBlock) {
            let contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            let editorState = EditorState.createWithContent(contentState);
            this.state = {
                loadingItems: true,
                mods: [],
                html: '',
                editorState,
                auditModsCount: this.props.auditModsCount,
                modsCount: this.props.modsCount,
                testableModsCount: this.props.testableModsCount,
                completeModsCount: this.props.completeModsCount,
                jiraModsCount: this.props.jiraModsCount,
                questionableModsCount: this.props.questionableModsCount,
                revokedModsCount: this.props.revokedModsCount
            }
        }
        console.log(this.state);
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id : "${this.props.submissionId}") {
                        file
                        received
                        processed
                        begin
                        packageurl
                        versions {
                            _id
                            version
                            mods {
                                _id
                                modnumber
                                title
                                isaudit
                                trackerid
                                moddetails
                                status
                                jira
                                teststeps
                                sidenotes
                                rewrite
                                testingzip {
                                    _id
                                    url
                                }
                            }
                        }
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
            loadingItems: false,
            mods: ModsList
        });
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

    deleteMod = async (id) => {
        try {
            await strapi.request('DELETE', `/mods/${id}`, {
                data: {
                    query: `mutation {
                        deleteMods(input: {
                          where: {
                            id: "${id}"
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
            //window.location.reload();
            let mods = this.state.mods;
            let index = mods.findIndex(x => x._id === id);
            mods.splice(index, 1);
            this.setState({
                mods: mods,
                modsCount: mods.length
            })
        } catch (err) {
            console.log(err);
        }
    }

    auditMod = async (id, isaudit) => {
        try {
            await strapi.request('POST', `/graphql`, {
                data: {
                    query: `mutation {
                        updateMods(input: {
                          where: {
                            id: "${id}"
                          }
                          data: {
                            isaudit: ${!isaudit}
                          }
                        }) {
                          mod {
                            isaudit
                          }
                        }
                      }`
                }
            });
            //window.location.reload();
            let mods = this.state.mods;
            let index = mods.findIndex(x => x._id === id)
            mods[index].isaudit = !isaudit;
            this.setState({
                mods: mods,
                auditModsCount: mods.filter(prop => {
                    return prop.isaudit === true
                }).length
            })
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

    renderMods() {
        let { mods } = this.state;
        return (
        mods.map((x, index) => {
        return (
            <Collapsible
            transitionTime='250'
            trigger={<span className='trigger'>Mod {index + 1} | {x.title} | {x.trackerid} </span>}
            triggerWhenOpen={<span className='trigger'>Mod {index + 1}</span>}
            >
            <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
            <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                <Link to={`/updatemod/${x._id}`}>
                    <FaEdit size={30} style={{marginTop:'5px', marginBottom: '5px'}}/>
                </Link>
            </div>
            <div className='iconbutton'>
            <a href={`${apiUrl}/admin/plugins/content-manager/mods/${x._id}?redirectUrl=/plugins/content-manager/mods?_limit=10&_page=1&_sort=_id&_q=abc&source=content-manager`} >
                    <FaFileUpload size={30} style={{marginTop:'5px', marginBottom: '5px'}}/>
                </a>
            </div>
            <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                <Link to='#' onClick={this.deleteMod.bind(this, x._id, index)} style={{backgroundColor: '#333'}}>
                    <FaTrash size={30} style={{color: 'red', marginTop:'5px', marginBottom: '5px'}}/>
                </Link>
            </div>
            <div className='iconbutton' style={{marginRight: '10px'}}>
                <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit, index)} style={{backgroundColor: '#333'}}>
                    <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                </Link>
            </div>
                {x.isaudit === true &&
                <Alert color='danger'>Audited</Alert>
                }
                <h5>Mod {index + 1}</h5>
                {x.trackerid != null && x.trackerid !== '' &&
                <h5>{x.trackerid}</h5>
                }
                <h5 style={{color: '#007bff'}}>{x.title}</h5>
                <h5>Testing Status: {x.status}</h5>
                {x.jira != null && x.jira !== '' &&
                    <h5>
                        <a href={x.jira} style={{backgroundColor: 'black', color: 'orange'}}>Jira</a>
                    </h5>
                }
                {x.testingzip != null &&
                    <h5>
                        <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                    </h5>
                }
                <Collapsible 
                transitionTime={250}
                trigger={this.renderDropDown4()}
                triggerWhenOpen={this.renderHide()}
                >
                    <Editor 
                    editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                    readOnly='true'
                    toolbarHidden='true'
                    />
                </Collapsible>
                {x.teststeps != null &&
                    <Collapsible 
                    transitionTime={250}
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                }
                {x.sidenotes != null && x.sidenotes !== '' &&
                    <p>
                        <strong>Notes: {'\u00A0'}</strong>
                        <em>{x.sidenotes}</em>
                    </p>
                }
                {x.rewrite != null && x.rewrite !== '' &&
                    <p>
                        <strong>Rewrite:</strong> {x.rewrite}
                    </p>
                }
            </div>
            </Collapsible>
            );
            }
        ))
    }

    renderQuestionableMods = () => {
        let { mods } = this.state;
        let questionableMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('questionable'.toLowerCase())
        })

        return (
            <div>
                {questionableMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
            
        )
    }

    renderRevokedMods = () => {
        let { mods } = this.state;
        let revokedMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('revoked'.toLowerCase())
        })

        return (
            <div>
                {revokedMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
            
        )
    }

    renderAuditMods = () => {
        let { mods } = this.state;
        let auditMods = mods.filter(prop => {
            return prop.isaudit === true
        })
        /*let auditMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('audit'.toLowerCase())
        })*/
        return (
            <div>
                {auditMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    {x.isaudit === true &&
                    <Alert color='danger'>Audited</Alert>
                    }
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira} style={{backgroundColor: 'black', color: 'orange'}}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
        )
    }

    renderTestableMods = () => {
        let { mods } = this.state;
        let testableMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('testable'.toLowerCase())
        });
        return (
            <div>
                {testableMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    {x.isaudit === true &&
                    <Alert color='danger'>Audited</Alert>
                    }
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira} style={{backgroundColor: 'black', color: 'orange'}}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null && x.sidenotes != '' &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
        )
    }

    renderJiraMods = () => {
        let { mods } = this.state;
        let jiraMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('jira'.toLowerCase())
        })
        return (
            <div>
                {jiraMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    {x.isaudit === true &&
                    <Alert color='danger'>Audited</Alert>
                    }
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira} style={{backgroundColor: 'black', color: 'orange'}}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
        )
    }

    renderCompleteMods = () => {
        let { mods } = this.state;
        let completeMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('complete'.toLowerCase())
        })
        return (
            <div>
                {completeMods.map(x => {
                return (
                    <Collapsible
                    transitionTime='250'
                    trigger={<span className='trigger'>Mod {x.modnumber} | {x.title}</span>}
                    triggerWhenOpen={<span className='trigger'>Mod {x.modnumber}</span>}
                    >
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee', display: 'block'}}>
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
                    <div className='iconbutton' style={{marginLeft: '10px', marginRight: '10px'}}>
                        <Link to='#' onClick={this.auditMod.bind(this, x._id, x.isaudit)} style={{backgroundColor: '#333'}}>
                            <FaSearchDollar size={30} style={{color: 'orange', marginTop:'5px', marginBottom: '5px'}}/>
                        </Link>
                    </div>
                    {x.isaudit === true &&
                    <Alert color='danger'>Audited</Alert>
                    }
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null && x.jira !== '' &&
                        <h5>
                            <a href={x.jira} style={{backgroundColor: 'black', color: 'orange'}}>Jira</a>
                        </h5>
                    }
                    {x.testingzip != null &&
                        <h5>
                            <a href={`${apiUrl}${x.testingzip.url}`} style={{backgroundColor: 'black', color: 'hsl(128, 100%, 50%)'}}>Download Testing Performed</a>
                        </h5>
                    }
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown4()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.moddetails.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    {x.teststeps != null &&
                    <Collapsible 
                    transitionTime="250"
                    trigger={this.renderDropDown9()}
                    triggerWhenOpen={this.renderHide()}
                    >
                        <Editor 
                        editorState={EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(x.teststeps.replace(/'''/g, '"')).contentBlocks))}
                        readOnly='true'
                        toolbarHidden='true'
                        />
                    </Collapsible>
                    }
                    {x.sidenotes != null && x.sidenotes != '' &&
                        <p>
                            <strong>Notes: {'\u00A0'}</strong>
                            <em>{x.sidenotes}</em>
                        </p>
                    }
                </div>
                </Collapsible>
                )
                })}
            </div>
        )
    }

    renderDropDown3() {
        let { modsCount } = this.state;
        return (
            <span className="trigger">
                Mods:  ({modsCount})
            </span>
        );
    }

    renderDropDown4() {
        return (
            <span className="trigger">
                Details:
            </span>
        );
    }

    renderDropDown9() {
        return (
            <span className="trigger">
                Test Steps:
            </span>
        );
    }

    renderDropDown5() {
        let { auditModsCount } = this.state;
        return (
            <span className="trigger">
                Audited Mods: ({auditModsCount})
            </span>
        );
    }

    renderDropDown6() {
        let { testableModsCount } = this.state;
        return (
            <span className="trigger">
                Testable Mods: ({testableModsCount})
            </span>
        );
    }

    renderDropDown7() {
        let { jiraModsCount } = this.state;
        return (
            <span className="trigger">
                Mods in JIRA:  ({jiraModsCount})
            </span>
        );
    }

    renderDropDown8() {
        let { questionableModsCount } = this.state;
        return (
            <span className="trigger">
                Possible Audit:  ({questionableModsCount})
            </span>
        );
    }

    renderDropDown11() {
        let { revokedModsCount } = this.state;
        return (
            <span className="trigger">
                Revoked Mods: ({revokedModsCount})
            </span>
        );
    }

    renderDropDown10() {
        let { completeModsCount } = this.state;
        return (
            <span className="trigger">
                Completed:  ({completeModsCount})
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

    render() {
        let { loadingItems, revokedModsCount, auditModsCount, completeModsCount, jiraModsCount, questionableModsCount, testableModsCount } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                <Collapsible 
                transitionTime={250}
                trigger={this.renderDropDown3()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderMods()}
                </Collapsible>
                {auditModsCount > 0 &&
                <Collapsible 
                transitionTime={250}
                trigger={this.renderDropDown5()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderAuditMods()}
                </Collapsible>}
                {testableModsCount > 0 && 
                <Collapsible 
                transitionTime={250} 
                trigger={this.renderDropDown6()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderTestableMods()}
                </Collapsible>}
                {jiraModsCount > 0 &&
                <Collapsible 
                transitionTime={250} 
                trigger={this.renderDropDown7()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderJiraMods()}
                </Collapsible>}
                {questionableModsCount > 0 &&
                <Collapsible 
                transitionTime={250} 
                trigger={this.renderDropDown8()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderQuestionableMods()}
                </Collapsible>}
                {completeModsCount > 0 &&
                <Collapsible 
                transitionTime={250} 
                trigger={this.renderDropDown10()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderCompleteMods()}
                </Collapsible>}
                {revokedModsCount > 0 && 
                <Collapsible 
                transitionTime={250} 
                trigger={this.renderDropDown11()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderRevokedMods()}
                </Collapsible>}
                <div className="fixed-action-btn">
                    <Link style={{backgroundColor: '#333', marginRight: '20px'}} className="btn-floating btn-large right" to={`/newmod/${this.props.submissionId}`}>
                        <i className="material-icons" style={{color: 'hsl(128, 100%, 50%)'}}>add</i>
                    </Link>
                </div>
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default ModList;