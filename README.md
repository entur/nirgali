# nirgali

Frontend application to manage deviation messages, cancellations and extrajourneys.

This application has a corresponding backend component: [github.com/entur/enlil](https://github.com/entur/enlil).


## Local development

Start the local development server like this:

    npm start

Tests may be run like this:

    npm test

## Architecture

### Frontend

The frontend application is a simple vanilla Create React App. It loads configurations from the server side for environment specific values, so that a single build can be deployed to all environments.

### Database

The database uses collections and sub-collections and organizes data into codespaces and authorities. The reason is that the situation number count is on the codespace level, where as messages are per authority.

Each codespace document has an authorities collection and a nextSituationNumber property.

Each authority document has a messages collection. Message documents have auto generated IDs. The schema of each document is modelled after SIRI-SX.

Each authority document may also have a cancellations collection. Cancellation documents have auto generated IDs. The schema of each document is modelled after SIRI-ET.

### Indexes

Indexes have been added for efficient querying from the xml function. The indexes are defined in `firestore.indexes.json`, but are easier to read in the firebase console.

### Rules

Rules are defined in `firestore.rules` to authorize users' access to specific documents. The rules use the `editSX` role to limit access to given codespaces.

## Deployment

Deployment is handled by [circleci](https://app.circleci.com/pipelines/github/entur/deviation-messages). Deployment to staging and production requires manual approval.

## Infrastructure

Configuration for the frontend app is located in the `config/` folder.

#### Firebase requirements:

* The firebase database needs to be set to native mode

