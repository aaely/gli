import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { FaRegEdit } from 'react-icons/fa';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Collapsible from 'react-collapsible';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class ModList extends Component {

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
                mods: [],
                application: [],
                html: '',
                editorState,
                auditModsCount: 0,
                modsCount: 0,
                testableModsCount: 0,
                completeModsCount: 0,
                jiraModsCount: 0,
                revokedModsCount: 0
            }
        }
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
                        jurisdictions {
                        _id
                        jurisdiction
                      }
                      mods {
                        _id
                        modnumber
                        title
                        trackerid
                        moddetails
                        status
                        jira
                        testingzip {
                            _id
                            url
                        }
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
                            testingzip {
                                _id
                                url
                            }
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
        let getMods = response.data.submission.versions.map(a => {return a.mods});
        let ModsList = [];
        for (let i = 0; i < getMods.length; i++){
            let j = 0;
            while (j < getMods[i].length) {
                ModsList.push(getMods[i][j])
                j++
            }
        }
        console.log(ModsList);
        this.setState({
            submission: response.data.submission.file,
            loadingItems: false,
            mods: ModsList,
            application: response.data.submission.application,
            modsCount: ModsList.length,
            auditModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('audit'.toLowerCase())
            }).length,
            testableModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('testable'.toLowerCase())
            }).length,
            completeModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('complete'.toLowerCase())
            }).length,
            jiraModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('jira'.toLowerCase())
            }).length,
            revokedModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('revoked'.toLowerCase())
            }).length
        });
        console.log(this.state);
        } catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }
    
    renderMods() {
        let { mods } = this.state;
        mods = mods.sort((a, b) => (a.modnumber - b.modnumber));
        return (
        mods.map(x => {
        return (
            <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                <h5><Link to={`/updatemod/${x._id}`}><FaRegEdit /></Link></h5>
                <h5>Mod {x.modnumber}</h5>
                <h5 style={{color: '#007bff'}}>{x.title}</h5>
                <h5>{x.trackerid}</h5>
                <h5>Testing Status: {x.status}</h5>
                {x.jira != null &&
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
            </div>
            );}
        ))
    }

    renderAuditMods = () => {
        let { mods } = this.state;
        let auditMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('audit'.toLowerCase())
        })

        return (
            <div>
                {auditMods.map(x => {
                return (
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                    <h5>Mod {x.modnumber}</h5>
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>{x.trackerid}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null &&
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
                </div>
                )
                })}
            </div>
        )
    }

    renderTestableMods = () => {
        let { mods } = this.state;
        let testableMods = mods.filter(prop => {
            return prop.status.toLowerCase().includes('testable'.toLowerCase())
        })
        return (
            <div>
                {testableMods.map(x => {
                return (
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                    <h5>Mod {x.modnumber}</h5>
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>{x.trackerid}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null &&
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
                </div>
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
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                    <h5>Mod {x.modnumber}</h5>
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
                    <h5>{x.trackerid}</h5>
                    <h5>Testing Status: {x.status}</h5>
                    {x.jira != null &&
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
                </div>
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

    renderHide() {
        return (
            <span className="trigger">
                Hide
            </span>
        );
    }

    render() {
        //let { modsCount, auditModsCount, testableModsCount, jiraModsCount, completeModsCount } = this.state;
        return(
            <div>
                {//modsCount > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown3()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderMods()}
                </Collapsible>}
                {//auditModsCount > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown5()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderAuditMods()}
                </Collapsible>}
                {//testableModsCount > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown6()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderTestableMods()}
                </Collapsible>}
                {//jiraModsCount > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown7()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderJiraMods()}
                </Collapsible>}
                <p style={{marginTop: '25px'}}></p>
                <div className="fixed-action-btn">
                <Link style={{backgroundColor: '#333'}} className="btn-floating btn-large" to={`/newmod/${this.props.submissionId}`}>
                    <i className="material-icons" style={{color: 'rgb(0, 123, 255)'}}>add</i>
                </Link>
                </div>
            </div>
        );
    }
}

export default ModList;