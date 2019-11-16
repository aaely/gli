import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { pdfjs, Document, Page, View } from 'react-pdf';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Collapsible from 'react-collapsible';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const apiUrl = process.env.API_URL || 'http://nv-dt-534:1337';
const strapi = new Strapi(apiUrl);

class Submission extends Component {
    /*state = {
        loadingItems: true,
        submission: '',
        jurisdictions: [],
        vendor: '',
        vendorId: '',
        numPages: null,
        pageNumber: 1,
        urns: [],
        mods: []
    }*/

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
                numPages: null,
                pageNumber: 1,
                urns: [],
                mods: [],
                application: [],
                versions: [],
                html: '',
                editorState,
                uploadedImages: [],
                auditModsCount: 0,
                modsCount: 0,
                testableModsCount: 0,
                completeModsCount: 0,
                jiraModsCount: 0,
                questionableModsCount: 0
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
                      mods {
                          _id
                          modnumber
                          title
                          trackerid
                          moddetails
                          status
                          jira
                          teststeps
                          testingzip {
                              _id
                              url
                          }
                      }
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
            submission: response.data.submission.file,
            vendor: response.data.submission.vendor.name,
            jurisdictions: response.data.submission.jurisdictions,
            loadingItems: false,
            vendorId: response.data.submission.vendor._id,
            urns: response.data.submission.urns,
            mods: response.data.submission.mods,
            application: response.data.submission.application,
            versions: response.data.submission.versions,
            modsCount: response.data.submission.mods.length,
            auditModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('audit'.toLowerCase())
            }).length,
            testableModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('testable'.toLowerCase())
            }).length,
            completeModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('complete'.toLowerCase())
            }).length,
            jiraModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('jira'.toLowerCase())
            }).length,
            questionableModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('questionable'.toLowerCase())
            }).length
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

    renderMods() {
        let { mods } = this.state;
        mods = mods.sort((a, b) => (a.modnumber - b.modnumber));
        return (
        mods.map(x => {
        return (
            <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                <h5>Mod {x.modnumber}</h5>
                <h5>{x.trackerid}</h5>                   
                <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
            </div>
            );}
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
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
                </div>
                )
                })}
            </div>
        )
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
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
                </div>
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
                    <div className="card" key={x._id} style={{marginTop: '10px', backgroundColor: '#eee'}}>
                    <h5>Mod {x.modnumber}</h5>
                    <h5>{x.trackerid}</h5>                   
                    <h5 style={{color: '#007bff'}}>{x.title}</h5>
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
                </div>
                )
                })}
            </div>
        )
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
                URNs:
            </span>
        );
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

    onDocumentLoadSuccess = ({ numPages }) => {
        this.setState({ numPages });
      }

      changePage = offset => this.setState(prevState => ({
        pageNumber: prevState.pageNumber + offset,
      }));
    
      previousPage = () => this.changePage(-1);
    
      nextPage = () => this.changePage(1);

      tableOfContents = () => this.setState({ pageNumber: 4});

      onItemClick = ({ pageNumber }) => this.setState({ pageNumber: pageNumber });

      //removes the offset of text from the rendered PDF file
      removeTextLayerOffset = () => {
        const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
          textLayers.forEach(layer => {
            const { style } = layer;
            style.top = "0";
            style.left = "0";
            style.transform = "";
        });
      }

      renderURNs = () => {
          let { urns, pageNumber, numPages } = this.state;
          return (
            <div>
                {urns.map(a => {
                    return (
                        <div>
                            <p>Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}</p>
                            <button
                            type="button"
                            disabled={pageNumber <= 1}
                            onClick={this.previousPage}
                            >
                                Back
                            </button>
                            <button
                            type="button"
                            disabled={pageNumber >= numPages}
                            onClick={this.nextPage}
                            >
                                Next
                            </button>
                            <button
                            type="button"
                            onClick={this.tableOfContents}
                            >
                                Table of Contents
                            </button>
                            <Document
                            file={`${apiUrl}${a.url}`}
                            className='canvas'
                            onLoadSuccess={this.onDocumentLoadSuccess}
                            onItemClick={this.onItemClick}
                            >
                                <Page pageNumber={pageNumber} onLoadSuccess={this.removeTextLayerOffset}/>
                            </Document>                        
                        </div>
                    )
                })}
            </div>
          );
      }
    
    render() {
        let { submission, vendor, jurisdictions, loadingItems, vendorId, application, versions, modsCount, auditModsCount, completeModsCount, jiraModsCount, questionableModsCount, testableModsCount } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                <h1 style={{textAlign: 'center'}}>{submission}</h1>
                <Link to={`/manufacturer/${vendorId}`}><h3 style={{textAlign: 'center'}}>{vendor}</h3></Link><br />
                <h1 style={{textAlign: 'center'}}><Link to={`/application/${application._id}`}>{application.name} {versions.map(y => {
                    return (
                        <span>{y.version}</span>
                    )
                })}</Link></h1>
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown1()}
                triggerWhenOpen={this.renderHide()}
                >
                {jurisdictions.map(jurs => {
                    return(
                        <div>
                           <Link to={`/jurisdiction/${jurs._id}`}>{jurs.jurisdiction}</Link>
                        </div>
                    );
                })}
                </Collapsible>
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown2()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderURNs()}
                </Collapsible>
                <div>
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown3()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderMods()}
                </Collapsible>
                {auditModsCount > 0 &&
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown5()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderAuditMods()}
                </Collapsible>}
                {testableModsCount > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown6()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderTestableMods()}
                </Collapsible>}
                {jiraModsCount > 0 &&
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown7()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderJiraMods()}
                </Collapsible>}
                {questionableModsCount > 0 &&
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown8()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderQuestionableMods()}
                </Collapsible>}
                {completeModsCount > 0 &&
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown10()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderCompleteMods()}
                </Collapsible>}
                </div>
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Submission;