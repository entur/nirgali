const { createApolloFetch } = require('apollo-fetch');

const createFetch = (URI, accessToken) => {
  const apolloFetch = createApolloFetch({
    uri: URI,
  });

  apolloFetch.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {}; // Create the headers object if needed.
    }
    options.headers['ET-Client-Name'] = 'entur - deviation-messages';

    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
    }

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

const getMessages = (URI, auth) => async (codespace, authority) => {
  const accessToken = await auth.getAccessToken();
  const apolloFetch = createFetch(URI, accessToken);

  const query = `
    query MessagesQuery($authority:String!, $codespace: String!) {
  situationElements(authority: $authority, codespace: $codespace) {
    id
    creationTime
    participantRef
    progress
    reportType
    severity
    situationNumber
    advice {
      attributes {
        xmlLang
      }
      text
    }
    affects {
      networks {
        affectedNetwork {
          affectedLine {
            lineRef
            routes {
              affectedRoute {
                stopPoints {
                  affectedStopPoint {
                    stopPointRef
                  }
                }
              }
            }
          }
        }
      }
      stopPoints {
        affectedStopPoint {
          stopPointRef
        }
      }
      vehicleJourneys {
        affectedVehicleJourney {
          framedVehicleJourneyRef {
            dataFrameRef
            datedVehicleJourneyRef
          }
          route {
            stopPoints {
              affectedStopPoint {
                stopPointRef
              }
            }
          }
        }
      }
    }
    description {
      attributes {
        xmlLang
      }
      text
    }
    infoLinks {
      infoLink {
        uri
        label
      }
    }
    source {
      sourceType
    }
    summary {
      attributes {
        xmlLang
      }
      text
    }
    validityPeriod {
      endTime
      startTime
    }
  }
}`;

  const variables = {
    codespace,
    authority,
  };

  return apolloFetch({ query, variables })
    .catch((error) => error)
    .then((response) => response);
};

const createOrUpdateMessage =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = await auth.getAccessToken();
    const apolloFetch = createFetch(URI, accessToken);

    const query = `
    mutation CreateOrUpdateMessage($codespace: String!, $authority: String!, $input: SituationElementInput!) {
      createOrUpdateSituationElement(codespace: $codespace, authority: $authority, input: $input)
    }
  `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return apolloFetch({ query, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getCancellations = (URI, auth) => async (codespace, authority) => {
  const accessToken = await auth.getAccessToken();
  const apolloFetch = createFetch(URI, accessToken);

  const query = `
    query CancellationsQuery($authority:String!, $codespace: String!) {
  cancellations(authority: $authority, codespace: $codespace) {
    id
    estimatedVehicleJourney {
      cancellation
      lineRef
      directionRef
      dataSource
      estimatedVehicleJourneyCode
      expiresAtEpochMs
      extraJourney
      groupOfLinesRef
      isCompleteStopSequence
      monitored
      operatorRef
      publishedLineName
      recordedAtTime
      routeRef
      vehicleMode
      estimatedCalls {
        estimatedCall {
          aimedArrivalTime
          aimedDepartureTime
          arrivalBoardingActivity
          arrivalStatus
          cancellation
          departureBoardingActivity
          departureStatus
          destinationDisplay
          expectedArrivalTime
          expectedDepartureTime
          order
          requestStop
          stopPointName
          stopPointRef
        }
      }
      framedVehicleJourneyRef {
        dataFrameRef
        datedVehicleJourneyRef
      }
    }
  }
}`;

  const variables = {
    codespace,
    authority,
  };

  return apolloFetch({ query, variables })
    .catch((error) => error)
    .then((response) => response);
};

const createOrUpdateCancellation =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = await auth.getAccessToken();
    const apolloFetch = createFetch(URI, accessToken);

    const query = `
    mutation CreateOrUpdateCancellation($codespace: String!, $authority: String!, $input: CancellationInput!) {
      createOrUpdateCancellation(codespace: $codespace, authority: $authority, input: $input)
    }
  `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return apolloFetch({ query, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getExtrajourneys = (URI, auth) => async (codespace, authority) => {
  const accessToken = await auth.getAccessToken();
  const apolloFetch = createFetch(URI, accessToken);

  const query = `
    query ExtraJourneysQuery($authority:String!, $codespace: String!) {
  extrajourneys(authority: $authority, codespace: $codespace) {
    id
    estimatedVehicleJourney {
      cancellation
      lineRef
      directionRef
      dataSource
      estimatedVehicleJourneyCode
      expiresAtEpochMs
      extraJourney
      groupOfLinesRef
      isCompleteStopSequence
      monitored
      operatorRef
      publishedLineName
      recordedAtTime
      routeRef
      vehicleMode
      estimatedCalls {
        estimatedCall {
          aimedArrivalTime
          aimedDepartureTime
          arrivalBoardingActivity
          arrivalStatus
          cancellation
          departureBoardingActivity
          departureStatus
          destinationDisplay
          expectedArrivalTime
          expectedDepartureTime
          order
          requestStop
          stopPointName
          stopPointRef
        }
      }
      framedVehicleJourneyRef {
        dataFrameRef
        datedVehicleJourneyRef
      }
    }
  }
}`;

  const variables = {
    codespace,
    authority,
  };

  return apolloFetch({ query, variables })
    .catch((error) => error)
    .then((response) => response);
};

const createOrUpdateExtrajourney =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = await auth.getAccessToken();
    const apolloFetch = createFetch(URI, accessToken);

    const query = `
    mutation CreateOrUpdateExtrajourney($codespace: String!, $authority: String!, $input: ExtrajourneyInput!) {
      createOrUpdateExtrajourney(codespace: $codespace, authority: $authority, input: $input)
    }
  `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return apolloFetch({ query, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getUserContext = (URI, auth) => async () => {
  const accessToken = await auth.getAccessToken();
  const apolloFetch = createFetch(URI, accessToken);

  const query = `
    query GetUserContext {
      userContext {
        allowedCodespaces
      }
    }
  `;

  return apolloFetch({ query })
    .catch((error) => error)
    .then((response) => response);
};

const api = (config, auth) => ({
  getAuthorities: getAuthorities(config['journey-planner-api']),
  organisationID: organisationID(config['organisations-api']),
  getLines: getLines(config['journey-planner-api']),
  getDepartures: getDepartures(config['journey-planner-api']),
  getServiceJourney: getServiceJourney(config['journey-planner-api']),
  getOperators: getOperators(config['journey-planner-api']),
  getStopPlaces: getStopPlaces(config['stop-places-api']),
  getTopographicPlaces: getTopographicPlaces(config['stop-places-api']),
  getMessages: getMessages(config['deviation-messages-api'], auth),
  createOrUpdateMessage: createOrUpdateMessage(
    config['deviation-messages-api'],
    auth,
  ),
  getCancellations: getCancellations(config['deviation-messages-api'], auth),
  createOrUpdateCancellation: createOrUpdateCancellation(
    config['deviation-messages-api'],
    auth,
  ),
  getExtrajourneys: getExtrajourneys(config['deviation-messages-api'], auth),
  createOrUpdateExtrajourney: createOrUpdateExtrajourney(
    config['deviation-messages-api'],
    auth,
  ),
  getUserContext: getUserContext(config['deviation-messages-api'], auth),
});

export default api;
