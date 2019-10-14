import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

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
import test from './test';

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
        <Navbar />
        <Switch>
          <Route component={Dashboard} exact path="/" />
          <Route component={Submission} path="/submission/:submissionId" />
          <Route component={Applications} path="/apps/:appId" />
          <Route component={Jurisdiction} path="/jurisdiction/:jurisdictionId" />
          <Route component={Jurisdictions} path="/jurisdictions" />
          <Route component={Application} path="/application/:applicationId" />
          <Route component={Appwiki} path="/application/:applicationId/howto" />
          <Route component={Apps} path="/manufacturers" />
          <Route component={Vendors} path="/manufacturer/:vendorId" />
          <Route component={test} path="/test" />
        </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default App;