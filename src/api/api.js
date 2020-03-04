const { createApolloFetch } = require('apollo-fetch');

const URI = 'https://api.dev.entur.io/journey-planner/v2/graphql';

const getAuthorities = () => {
  const apolloFetch = createApolloFetch({
    uri: URI,
    headers: { 'ET-client-Name': 'entur - deviation-messages' }
  });
  const query = `
      {
        authorities{
          id
          name
        }
      } `;

  return apolloFetch({ query })
    .catch(error => error)
    .then(response => response);
};

const getLines = authorities => {
  const apolloFetch = createApolloFetch({
    uri: URI,
    headers: { 'ET-client-Name': 'entur - deviation-messages' }
  });
  const query = `
      {
        lines(authorities: "${authorities}") {
          name
          id
          quays {
            id
            name
            stopPlace{
              id
            }
          }
        }
      } `;

  return apolloFetch({ query })
    .catch(error => error)
    .then(response => response);
};

const getDepartures = (line, date) => {
  const apolloFetch = createApolloFetch({
    uri: URI,
    headers: { 'ET-client-Name': 'entur - deviation-messages' }
  });
  const query = `
      {
        serviceJourneys(lines: "${line}", activeDates: "${date}") {
          id
          estimatedCalls(date:"${date}") {
            aimedDepartureTime
            quay {
              name
              stopPlace {
                id
              }
            }
          }
        }
      }`;

  return apolloFetch({ query })
    .catch(error => error)
    .then(response => response);
};

const getServiceJourney = (id, date) => {
  const apolloFetch = createApolloFetch({
    uri: URI,
    headers: { 'ET-client-Name': 'entur - deviation-messages' }
  });
  const query = `
    {
      serviceJourney(id: "${id}") {
        id
        line {id}
        estimatedCalls(date:"${date}") {
          aimedDepartureTime
          quay {
            name
          }
        }
      }
    }`;

  return apolloFetch({ query })
    .catch(error => error)
    .then(response => response);
};

const fetchGet = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'ET-Client-Name': 'entur - deviation-messages'
  }
};

const organisationID = id => {
  fetch(
    'https://api.staging.entur.io/organisations/v1/register/organisations/' +
      id,
    fetchGet
  )
    .catch(error => error)
    .then(response => response);
};

export default {
  getAuthorities,
  organisationID,
  getLines,
  getDepartures,
  getServiceJourney
};
