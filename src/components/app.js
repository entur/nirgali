import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Overview from './overview';
import Register from './register';
import Edit from './edit';
import NavBar from './navbar';
import Background from '../img/background.jpg';
import { TabPanel, TabPanels } from '@entur/tab';
import { TabsContainer } from './tabs-container';

export default class App extends React.Component {
  state = {
    organizations: [],
    organizationsName: [],
    selectedOrganization: '',
    messages: [],
    lines: [],
  };

  componentDidMount() {
    this.setOrganizations();
    this.db = this.props.firebase.firestore();
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
      () => this.getMessagesAndLines()
    );
  };

  updateOrganization = (selectedOrg) => {
    this.setState(
      {
        selectedOrganization: selectedOrg,
      },
      () => this.getMessagesAndLines()
    );
  };

  getMessagesAndLines = async () => {
    await this.getMessages();
    await this.getLines();
  };

  getMessages = async () => {
    if (this.unsubscribeSnapshotListener) {
      this.unsubscribeSnapshotListener();
    }
    const codespace = this.state.selectedOrganization.split(':')[0];
    const authority = this.state.selectedOrganization;
    this.unsubscribeSnapshotListener = this.db
      .collection(`codespaces/${codespace}/authorities/${authority}/messages`)
      .onSnapshot(this.onMessagesUpdate);
  };

  onMessagesUpdate = (querySnapshot) => {
    this.setState({
      messages:
        querySnapshot.size > 0
          ? querySnapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }))
          : [],
    });
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
            <TabsContainer>
              <TabPanels>
                <TabPanel>
                  <Routes>
                    <Route
                      path="/meldinger"
                      exact
                      element={<Overview messages={this.state.messages} />}
                    />
                    <Route
                      path="/meldinger/:id"
                      element={
                        <Edit
                          messages={this.state.messages}
                          lines={this.state.lines}
                          firebase={this.db}
                          api={this.props.api}
                          organization={this.state.selectedOrganization}
                        />
                      }
                    />
                    <Route
                      path="/meldinger/ny"
                      element={
                        <Register
                          api={this.props.api}
                          firebase={this.db}
                          lines={this.state.lines}
                          organization={this.state.selectedOrganization}
                        />
                      }
                    />
                  </Routes>
                </TabPanel>
              </TabPanels>
            </TabsContainer>
          </div>
        </div>
      </Router>
    );
  }
}
