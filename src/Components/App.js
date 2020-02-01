import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import '../CSS/StyleSheet1.css';

import Dashboard from './Dashboard';
import Submission from './Submission';
import Applications from './Submission';
import Navbar from './Navbar';
import Apps from './Apps';
import Jurisdiction from './Jurisdiction';
import Jurisdictions from './Jurisdictions';
import Application from './Application';
import Vendors from './Vendors';
import Appwiki from './Appwiki';
import ModTestPlan from './ModTestPlan';
import Newmod from './Newmod';
import UpdateMod from './UpdateMod';
import ReWrites from './ReWrites';
import NewSubmission from './NewSubmission';
import NewSub from './NewSub';
import ReactstrapNav from './ReactstrapNav';
import WebsocketTest from './test';

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
        {/*<Navbar />*/}
        <ReactstrapNav />
        <Switch>
          <Route component={Dashboard} exact path="/" />
          <Route component={Submission} path="/submission/:submissionId" />
          <Route component={Applications} path="/apps/:appId" />
          <Route component={Jurisdiction} path="/jurisdiction/:jurisdictionId" />
          <Route component={Jurisdictions} path="/jurisdictions" />
          <Route component={Application} path="/application/:applicationId" />
          <Route component={Appwiki} path="/application/:applicationId/howto" />
          <Route component={Apps} path="/manufacturers" />
          <Route component={ReWrites} path="/rewrites/:submissionId" />
          <Route component={Vendors} path="/manufacturer/:vendorId" />
          <Route component={Newmod} path="/newmod/:submissionId" />
          <Route component={UpdateMod} path="/updatemod/:modId" />
          <Route component={ModTestPlan} path="/modtestplan/:submissionId" />
          <Route component={NewSubmission} path="/newsubmission/:applicationId" />
          <Route component={NewSub} path="/newsubmission" />
          <Route component={WebsocketTest} path="/test" />
        </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default App;