import React from 'react';
import ReactDOM from 'react-dom';
import auth from './authenticate/auth';
import App from './components/app';
import api from './api/api';
import * as firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";

import 'bootstrap/dist/css/bootstrap.css';
import './style/index.css';

const renderApp = (userInfo, config) => {
  ReactDOM.render((
    <App firebase={firebase} userInfo={userInfo} api={api(config)}/>
  ), document.getElementById('root'));
};

const init = async () => {
  const configResponse = await fetch('/config.json');
  const config = await configResponse.json();

  const firebaseConfigResponse = await fetch('/__/firebase/init.json');
  firebase.initializeApp(await firebaseConfigResponse.json());

  const headers = token => ({
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  const newTokenHandler = async token => {
    const authResponse = await fetch('/api/auth/firebase', headers(token));
    const {firebaseToken} = await authResponse.json();
    return firebase.auth().signInWithCustomToken(firebaseToken);
  };

  auth.initAuth(async (token, userInfo) => {
    await newTokenHandler(token);
    renderApp(userInfo, config);
  }, newTokenHandler);
}

init();
