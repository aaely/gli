import React, { Component } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import Jurisdictions from './Jurisdictions';
import Submissions from './Submissions';
import Manufacturers from './Manufacturers';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '2'
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    return (
      <div>
        <p style={{ backgroundColor: 'black', color: 'green', textAlign: 'center'}}><h1>Search By</h1></p>
        <Nav tabs style={{backgroundColor: 'black', color: 'green', marginTop: '5px', marginBottom: '5px'}}>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Manufacturer
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Submission File Number
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
            className={classnames({ active: this.state.activeTab === '3' })}
            onClick={() => { this.toggle('3'); }}
            >
            Jurisdictions
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Manufacturers />
          </TabPane>
          <TabPane tabId="2">
            <Submissions />
          </TabPane>
          <TabPane tabId="3">
            <Jurisdictions />
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

export default Dashboard;