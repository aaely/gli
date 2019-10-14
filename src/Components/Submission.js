import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
import { pdfjs, Document, Page } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const apiUrl = process.env.API_URL || 'http://192.168.0.178:1337';
const strapi = new Strapi(apiUrl);

class Submission extends Component {
    state = {
        loadingItems: true,
        submission: '',
        jurisdictions: [],
        vendor: '',
        vendorId: '',
        numPages: null,
        pageNumber: 1,
        urns: []
    }

    async componentDidMount() {
        try {
            console.log(this.props.match.params.submissionId);
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
            urns: response.data.submission.urns
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    onDocumentLoadSuccess = ({ numPages }) => {
        this.setState({ numPages });
      }

      changePage = offset => this.setState(prevState => ({
        pageNumber: prevState.pageNumber + offset,
      }));
    
      previousPage = () => this.changePage(-1);
    
      nextPage = () => this.changePage(1);

      onItemClick = ({ pageNumber }) => this.setState({ pageNumber });
    
    render() {
        let { submission, vendor, jurisdictions, loadingItems, vendorId, numPages, pageNumber, urns } = this.state;
        return(
            <div>
                <h1 style={{textAlign: 'center'}}>{submission}</h1>
                <Link to={`/manufacturer/${vendorId}`}><h3 style={{textAlign: 'center'}}>{vendor}</h3></Link>
                <h3>
                    Jurisdictions this file is submitted for:
                </h3>
                {jurisdictions.map(jurs => {
                    return(
                        <div>
                           <Link to={`/jurisdiction/${jurs._id}`}>{jurs.jurisdiction}</Link>
                        </div>
                    );
                })}
                {urns.map(a => {
                    return (
                        <div>
                            <Document
                            file={a.url}
                            onLoadSuccess={this.onDocumentLoadSuccess}
                            onItemClick={this.onItemClick}
                            >
                                <Page pageNumber={pageNumber} />
                            </Document>
                            <p>Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'} of {numPages}</p>
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
                        </div>
                    )
                })}
                {loadingItems && <Loader />}
            </div>
        );
    }
}

export default Submission;