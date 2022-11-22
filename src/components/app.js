import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import NavBar from './navbar';
import Background from '../img/background.jpg';
import { TabPanel, TabPanels } from '@entur/tab';
import { TabsContainer } from './tabs-container';
import { Messages } from './messages/messages';
import { Cancellations } from './cancellations/cancellations';

export default class App extends React.Component {
  state = {
    organizations: [],
    organizationsName: [],
    selectedOrganization: '',
    lines: [],
  };

  componentDidMount() {
    this.setOrganizations();
  }

  logout = () => {
    this.props.auth.logout({ returnTo: window.location.origin });
  };

  setOrganizations = async () => {
    if (!this.props.auth.roleAssignments?.length > 0) {
      this.logout();
    }

    const allowedCodespaces = this.props.auth.roleAssignments
      ?.map(JSON.parse)
      .filter(({ r: role }) => role === 'editSX')
      .map(({ o: org }) => org);

    if (!allowedCodespaces.length > 0) {
      this.logout();
    }

    const response = await this.props.api.getAuthorities();
    const organizations = response.data.authorities.filter((authority) =>
      allowedCodespaces.includes(authority.id.split(':')[0])
    );

    if (!organizations.length > 0) {
      this.logout();
    }

    this.setState(
      {
        organizations: organizations.map(({ id }) => id),
        organizationsName: organizations.map(({ name }) => name),
        selectedOrganization: organizations[0].id,
      },
      () => this.getLines()
    );
  };

  updateOrganization = (selectedOrg) => {
    this.setState(
      {
        selectedOrganization: selectedOrg,
      },
      () => this.getLines()
    );
  };

  getLines = async () => {
    const response = await this.props.api.getLines(
      this.state.selectedOrganization
    );
    if (response.data) {
      this.setState({
        lines: response.data.lines,
      });
    } else {
      console.log('Could not find any lines for this organization');
    }
  };

  render() {
    return (
      <Router>
        <img className="background-image" src={Background} alt="" />
        <NavBar
          onSelectOrganization={this.updateOrganization}
          user={this.state.organizations}
          name={this.state.organizationsName}
          logout={() => this.logout()}
        />
        <div>
          <div className="register_box">
            <Routes>
              <Route path="/" element={<Navigate to="/meldinger" />} />
              <Route
                path="/:tab/*"
                element={
                  <TabsContainer>
                    {(selectedTab) => (
                      <TabPanels>
                        <TabPanel>
                          {selectedTab === 0 && (
                            <Messages
                              selectedOrganization={
                                this.state.selectedOrganization
                              }
                              lines={this.state.lines}
                              api={this.props.api}
                              db={this.db}
                            />
                          )}
                        </TabPanel>

                        <TabPanel>
                          {selectedTab === 1 && (
                            <Cancellations
                              selectedOrganization={
                                this.state.selectedOrganization
                              }
                              lines={this.state.lines}
                              api={this.props.api}
                              db={this.db}
                            />
                          )}
                        </TabPanel>
                      </TabPanels>
                    )}
                  </TabsContainer>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }
}
