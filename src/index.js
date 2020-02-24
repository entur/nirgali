import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './style/index.css';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import Overview from "./components/overview";
import Register from './components/register';
import Edit from './components/edit';
import auth from './authenticate/auth';
import api from "./api/api";
import NavBar from "./components/navbar";
import Background from "./img/background.jpg";

var config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_TMDB_API_KEY
};

const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

firebase.initializeApp(config);
var db = firebase.firestore();

class App extends React.Component {
    state = {
        data: '',
        organizations: [],
        organizationsName: [],
        selectedOrganization: '',
        lines: '',
        id: '',
    };

    componentDidMount() {
        this.setOrganizations();
    }

    updateOrganization = (selectedOrg) => {
        this.setState({
            selectedOrganization: selectedOrg,
        },
          () => this.setDeviationsAndLines(selectedOrg));
    };

    setOrganizations() {
        let roles = this.props.userInfo.roles;
        let setRoles = [];
        let orgName = [];
        if(!roles){
            window.alert("You are not assigned to a company");
            window.location.href = this.props.userInfo.logoutUrl;
        }
        for (let i = 0; i < roles.length; i++) {
            const {r: role, o: org} = JSON.parse(roles[i]);
            if (role === 'editSX') {
                setRoles.push(org);
            }
        }

        // TODO: the following logic does not account for several authorities per codespace
        api.getAuthorities()
          .then(response => {
              const authorities = response.data.authorities;
              for (let i = 0; i < setRoles.length; i++) {
                  for (let j = 0; j < authorities.length; j++) {
                      if(authorities[j].id.includes(setRoles[i])){
                          setRoles[i] = authorities[j].id;
                          orgName[i] = authorities[j].name;
                      }
                  }
              }
              this.setState(
                { organizations: setRoles, organizationsName: orgName, selectedOrganization: setRoles[0] },
                ()  => this.setDeviationsAndLines(this.state.organizations[0]));
          });
    }

    setDeviationsAndLines(selectedOrganization) {

        // TODO add error handling
        db.collection(selectedOrganization).get().then((querySnapshot) => {
            for (let i = 0; i < querySnapshot.docs.length; i++) {
                if(querySnapshot.docs[i].id === 'Issues'){
                    if(querySnapshot.docs[i].data().PtSituationElement){
                        this.setState({
                            data: querySnapshot.docs[i].data(),
                            id: querySnapshot.docs[i].id,
                        });
                    }else{
                        this.setState({
                            data: {PtSituationElement: []},
                            id: querySnapshot.docs[i].id,
                        })
                    }
                }
            };
        });

        api.getLines(selectedOrganization)
          .then(response => {
              console.log(response.data);
              if(response.data){
                  this.setState({
                      lines: response.data.lines
                  })
              }else{
                  console.log("Could not find any lines for this organization");
              }
          });
    }

    render() {
        return (
            <Router>
                <div>
                    <img id="background" src={ Background } alt="" />

                    <Route path="/"
                           render={props => <NavBar {...props}
                                                    NavBar onSelectOrganization={this.updateOrganization}
                                                    user={this.state.organizations}
                                                    name={this.state.organizationsName}
                                                    logout={this.props.userInfo.logoutUrl} />} />
                    <Route exact path="/"
                           render={props => <Overview {...props}
                                                      firebase={db}
                                                      data={this.state.data} />} />
                    <Route path="/edit/:deviationId?"
                           render={props => <Edit {...props}
                                                  data={this.state.data}
                                                  firebase={db}
                                                  docID={this.state.id}
                                                  organization={this.state.selectedOrganization} />} />
                    <Route path="/register"
                           render={props => <Register {...props}
                                                      data={this.state.data}
                                                      firebase={db}
                                                      docID={this.state.id}
                                                      lines={this.state.lines}
                                                      organization={this.state.selectedOrganization} />} />
                </div>
            </Router>
        )
    }
}

const renderIndex = (userInfo) => {
    ReactDOM.render(
        <App userInfo={userInfo} />,
        document.getElementById('root')
    );
};

auth.initAuth(token => {
    return fetch('https://us-central1-deviation-messages.cloudfunctions.net/auth/firebase', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(resp => resp.json())
    .then(({ firebaseToken }) => firebase.auth().signInWithCustomToken(firebaseToken));
});

export default renderIndex;
