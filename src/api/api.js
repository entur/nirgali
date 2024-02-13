const { createApolloFetch } = require('apollo-fetch');

const createFetch = (URI) => {
  const apolloFetch = createApolloFetch({
    uri: URI,
  });

  apolloFetch.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {}; // Create the headers object if needed.
    }
    options.headers['ET-Client-Name'] = 'entur - deviation-messages';

    next();
  });

  return apolloFetch;
};

const getAuthorities = (URI) => () => {
  const apolloFetch = createFetch(URI);
  const query = `
      {
        authorities{
          id
          name
        }
      } `;

  return apolloFetch({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getLines = (URI) => (authorities) => {
  const apolloFetch = createFetch(URI);

  const query = `
      {
        lines(authorities: "${authorities}") {
          name
          id
          publicCode
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
    .catch((error) => error)
    .then((response) => response);
};

const getDepartures = (URI) => (line, date) => {
  const apolloFetch = createFetch(URI);

  const query = `
      {
        serviceJourneys(lines: "${line}", activeDates: "${date}") {
          id
          passingTimes {
            quay {
              id
            }
            forBoarding
            forAlighting
            requestStop
          }
          estimatedCalls(date:"${date}") {
            aimedDepartureTime
            aimedArrivalTime
            expectedDepartureTime
            expectedArrivalTime
            stopPositionInPattern
            quay {
              id
              name
              stopPlace {
                id
              }
            }
          }
        }
      }`;

  return apolloFetch({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getServiceJourney = (URI) => (id, date) => {
  const apolloFetch = createFetch(URI);

  const query = `
    {
      serviceJourney(id: "${id}") {
        id
        line {id}
        passingTimes {
          quay {
            id
          }
          forBoarding
          forAlighting
          requestStop
        }
        estimatedCalls(date:"${date}") {
          aimedDepartureTime
          aimedArrivalTime
          expectedDepartureTime
          expectedArrivalTime
          stopPositionInPattern
          quay {
            id
            name
            stopPlace {
              id
            }
          }
        }
      }
    }`;

  return apolloFetch({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getOperators = (URI) => () => {
  const apolloFetch = createFetch(URI);

  const query = `
    {
      operators {
        id
        name
      }
    }`;

  return apolloFetch({ query })
    .catch((error) => error)
    .then((response) => response);
};

const fetchGet = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'ET-Client-Name': 'entur - deviation-messages',
  },
};

const organisationID = (URI) => (id) => {
  fetch(`${URI}/${id}`, fetchGet)
    .catch((error) => error)
    .then((response) => response);
};

const getStopPlaces = (URI) => async (ids) => {
  const response = await fetch(`${URI}/stop-places?ids=${ids}`, {
    headers: {
      'Et-Client-Name': 'entur - deviation-messages',
    },
  });
  const stopPlaces = await response.json();
  return stopPlaces;
};

const getTopographicPlaces = (URI) => async (ids) => {
  const response = await fetch(`${URI}/topographic-places?ids=${ids}`, {
    headers: {
      'Et-Client-Name': 'entur - deviation-messages',
    },
  });
  const topographicPlaces = await response.json();
  return topographicPlaces;
};

const api = (config) => ({
  getAuthorities: getAuthorities(config['journey-planner-api']),
  organisationID: organisationID(config['organisations-api']),
  getLines: getLines(config['journey-planner-api']),
  getDepartures: getDepartures(config['journey-planner-api']),
  getServiceJourney: getServiceJourney(config['journey-planner-api']),
  getOperators: getOperators(config['journey-planner-api']),
  getStopPlaces: getStopPlaces(config['stop-places-api']),
  getTopographicPlaces: getTopographicPlaces(config['stop-places-api']),
});

export default api;
