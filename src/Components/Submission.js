import React, { Component } from 'react';
import Test from './propstest';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import MyPieChart from './PieChart';
import { FaRegEdit } from 'react-icons/fa';
import { pdfjs, Document, Page, View } from 'react-pdf';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Collapsible from 'react-collapsible';
import ModsList from './ModsList';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Submission extends Component {

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
                revokedModsCount: 0,
                activeIndex: 0
            }
        }
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
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
            application: response.data.submission.application,
            versions: response.data.submission.versions,
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
        let { urns, submission, vendor, jurisdictions, loadingItems, vendorId, application, versions } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                <h1 style={{textAlign: 'center'}}>{submission}</h1>
                <Link to={`/manufacturer/${vendorId}`}><h3 style={{textAlign: 'center'}}>{vendor}</h3></Link><br />
                <Link to={`/modrewrites/${this.props.match.params.submissionId}`}><h3 style={{textAlign: 'center'}}>Mod Rewrites</h3></Link><br />
                <h1 style={{textAlign: 'center'}}><Link to={`/application/${application._id}`}>{application.name} </Link></h1>
                <h3 style={{textAlign: 'center'}}>Versions:</h3>
                {versions.map(y => {
                    return (
                        <span>| {y.version} |{'\u00A0'} </span>
                    )
                })}
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
                {urns.length > 0 && 
                <Collapsible 
                transitionTime="250" 
                trigger={this.renderDropDown2()}
                triggerWhenOpen={this.renderHide()}
                >
                    {this.renderURNs()}
                </Collapsible>}
                {loadingItems === false && <MyPieChart submissionId={this.props.match.params.submissionId}/>}
                <ModsList submissionId={this.props.match.params.submissionId}/>
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Submission;