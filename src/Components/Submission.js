import React, { Component } from 'react';
import { PieChart, Pie, Legend, Sector, Cell } from 'recharts';
import { Button } from 'reactstrap';
import Collapsible from 'react-collapsible';
import ModList from './ModList';
import MyPieChart from './MyPieChart';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { pdfjs, Document, Page, View } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const apiUrl = process.env.API_URL || 'http://192.168.0.248:1337';
const strapi = new Strapi(apiUrl);   

class Submission extends Component {

    constructor(props) {
        super(props);
            this.state = {
                loadingItems: true,
                submission: '',
                jurisdictions: [],
                vendor: '',
                vendorId: '',
                numPages: null,
                pageNumber: 1,
                urns: [],
                application: [],
                versions: [],
                uploadedImages: [],
                excelsheet: [],
                packageurl: '',
                testableModsCount: 0,
                completeModsCount: 0,
                jiraModsCount: 0,
                questionableModsCount: 0,
                revokedModsCount: 0,
                auditModsCount: 0,
                activeIndex: 0
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
                        packageurl
                        modtestplan {
                            _id
                            url
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
                      versions {
                          _id
                          version
                          mods {
                            _id
                            status
                            isaudit
                        }
                      }
                  }
                }`
            }
        }
        );
        let getMods = response.data.submission.versions.map(a => {return a.mods.sort((a, b) => (a.modnumber - b.modnumber))});
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
            packageurl: response.data.submission.packageurl,
            excelsheet: response.data.submission.modtestplan,
            vendor: response.data.submission.vendor.name,
            jurisdictions: response.data.submission.jurisdictions,
            loadingItems: false,
            vendorId: response.data.submission.vendor._id,
            urns: response.data.submission.urns,
            application: response.data.submission.application,
            versions: response.data.submission.versions,
            modsCount: ModsList.length,
            auditModsCount: ModsList.filter(prop => {
                return prop.isaudit === true
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
            questionableModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('questionable'.toLowerCase())
            }).length,
            revokedModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('revoked'.toLowerCase())
            }).length
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
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
        let { packageurl, submission, vendor, jurisdictions, loadingItems, vendorId, application, versions, auditModsCount, modsCount, jiraModsCount, testableModsCount, completeModsCount, revokedModsCount, questionableModsCount } = this.state;
        return(
            <div style={{textAlign: 'center'}}>
                <h1 style={{textAlign: 'center'}}>{submission}</h1>
                <h3 style={{textAlign: 'center'}}><Link to={`/manufacturer/${vendorId}`}>{vendor}</Link></h3><br />
                <h1 style={{textAlign: 'center'}}><Link to={`/application/${application._id}`}>{application.name}</Link></h1><br />
                <h5 style={{textAlign: 'center'}}><strong><u>Versions attached to this submission:</u></strong></h5>
                {versions.map(y => {
                    return (
                        <p>{y.version}</p>
                    )
                })}
                <h5><Link to={`/modtestplan/${this.props.match.params.submissionId}`}>Mod Test Plan</Link></h5>
                <h5><Link to={`/rewrites/${this.props.match.params.submissionId}`}>ReWrites</Link></h5>
                {packageurl != null &&
                <Link to={packageurl}>DM Flash</Link>
                }
                {loadingItems === false &&
                    <MyPieChart 
                    submissionId={this.props.match.params.submissionId}
                    modsCount={modsCount}
                    auditModsCount={auditModsCount}
                    completeModsCount={completeModsCount}
                    jiraModsCount={jiraModsCount}
                    questionableModsCount={questionableModsCount}
                    revokedModsCount={revokedModsCount}
                    testableModsCount={testableModsCount}
                    />}
                <Collapsible 
                transitionTime={250} 
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
                {/*<Collapsible
                transitionTime={250}
                trigger={<span className='trigger'>URNs:</span>}
                >
                {this.renderURNs()}
                </Collapsible>*/}
                {loadingItems === false &&
                <ModList 
                submissionId={this.props.match.params.submissionId}
                modsCount={modsCount}
                auditModsCount={auditModsCount}
                completeModsCount={completeModsCount}
                jiraModsCount={jiraModsCount}
                questionableModsCount={questionableModsCount}
                revokedModsCount={revokedModsCount}
                testableModsCount={testableModsCount}
                history={this.props.history}
                />}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Submission;