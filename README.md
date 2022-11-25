# nirgali

Frontend application to manage deviation messages and cancellations, and serverless function to serve them in the SIRI xml format.

### Frontend application

In production, the frontend application is available at https://avvik.entur.org.

Frontend application assumes user has editSX role associated with one or more providers. Roles can be assigned in Ninkasi. Once logged in, the user selects a provider from a menu, and sees a list of currently active messages - if any. The user may then add new messages or edit existing messages.

### How to fetch XML

Send POST request to `/api/xml` -  in production https://avvik.entur.org/api/xml.

Request for SIRI-SX (SituationExchangeRequest):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns:ns3="http://www.ifopt.org.uk/ifopt" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0">
      <ServiceRequest>
        <RequestTimestamp>2020-02-10T08:57:23.397883+01:00</RequestTimestamp>
        <RequestorRef>ENTUR_DEV</RequestorRef>
        <SituationExchangeRequest version="2.0">
          <RequestTimestamp>2020-02-10T08:57:23.397893+01:00</RequestTimestamp>
          <MessageIdentifier>de353056-466d-44ef-a405-d11311281810</MessageIdentifier>
          <PreviewInterval>PT10H</PreviewInterval>
        </SituationExchangeRequest>
      </ServiceRequest>
    </Siri>

Request for SIRI-ET (EstimatedTimetableRequest):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns:ns3="http://www.ifopt.org.uk/ifopt" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0">
      <ServiceRequest>
        <RequestTimestamp>2019-11-06T14:45:00+01:00</RequestTimestamp>
        <RequestorRef>ENTUR_DEV-1</RequestorRef>
        <EstimatedTimetableRequest version="2.0">
          <RequestTimestamp>2019-11-06T14:45:00+01:00</RequestTimestamp>
          <MessageIdentifier>e11d9efb-ee7b-4a67-847a-a254e813f0da</MessageIdentifier>
        </EstimatedTimetableRequest>
      </ServiceRequest>
    </Siri>

At Entur, the Anshar application is responsible for consuming this endpoint and adding messages and cancellations to the real time updates of the journey planner.

### Custom tokens

In order to enforce security in the firebase database, a custom token is created in [the auth function](functions/auth) based on the auth0 token. The `editSX` roles are carried over to the custom token and used in `firestore.rules` for authorization.

## Local development

For local development, we use a combination of standard Create React App tools and the Firebase emulator suite. As a prequisite, you need to download the credentials for the Firebase service account, or your own user account provided it has the Token Creator role. Once you have the file, point to it like this before proceeding:

    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials"

Then start the local development server and firebase emulator suite like this:

    npm start

Tests may be run like this:

    npm test

## Architecture

### Frontend

The frontend application is a simple vanilla Create React App using Firebase SDK. It loads configurations from the server side for environment specific values, so that a single build can be deployed to all environments.

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

The auth function in firebase needs some config parameters to be set:

* `auth.firebase.auth0.auth_jwks_uri`
* `auth.firebase.auth0.auth_issuer`
* `auth.firebase.auth0.claims_namespace`

Use firebase cli to set them (project alias from .firebaserc)

    firebase -P <project alias> functions:config:set <key>=<value>

Dev values:

    firebase -P dev functions:config:get

Output:

    {
      "auth": {
        "firebase": {
          "auth0": {
            "auth_jwks_uri": "https://ror-entur-dev.eu.auth0.com/.well-known/jwks.json",
            "auth_issuer": "https://ror-entur-dev.eu.auth0.com/",
            "claims_namespace": "https://ror.entur.io/role_assignments"
          }
        }
      }
    }


Configuration for the frontend app is located in the `config/` folder.

#### Firebase requirements:

* The default service account for the firebase project requires Token Creator role
* The firebase database needs to be set to native mode
* The firebase project needs to have the IAM api enabled
