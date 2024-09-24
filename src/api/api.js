import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

const createClient = (uri, accessToken) => {
  const headers = {
    'ET-Client-Name': 'entur - deviation-messages',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache({
      addTypename: false,
    }),
    headers,
  });

  return client;
};

const getAuthorities = (URI) => async () => {
  const client = createClient(URI);
  const query = gql`
    {
      authorities {
        id
        name
      }
    }
  `;

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getLines = (URI) => async (authorities) => {
  const client = createClient(URI);

  const query = gql`
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

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getDepartures = (URI) => async (line, date) => {
  const client = createClient(URI);

  const query = gql`
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

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getServiceJourney = (URI) => async (id, date) => {
  const client = createClient(URI);

  const query = gql`
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

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getOperators = (URI) => async () => {
  const client = createClient(URI);

  const query = gql`
    {
      operators {
        id
        name
      }
    }
  `;

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const getStopPlaces = (URI) => async (ids) => {
  const response = await fetch(`${URI}/stop-places?ids=${ids}`, {
    headers: {
      'Et-Client-Name': 'entur - deviation-messages',
    },
  });
  return await response.json();
};

const getTopographicPlaces = (URI) => async (ids) => {
  const response = await fetch(`${URI}/topographic-places?ids=${ids}`, {
    headers: {
      'Et-Client-Name': 'entur - deviation-messages',
    },
  });
  return await response.json();
};

const getMessages = (URI, auth) => async (codespace, authority) => {
  const accessToken = auth.user.access_token;
  const client = createClient(URI, accessToken);

  const query = gql`
    query MessagesQuery($authority: String!, $codespace: String!) {
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
    }
  `;

  const variables = {
    codespace,
    authority,
  };

  return client
    .query({ query, variables })
    .catch((error) => error)
    .then((response) => response);
};

const createOrUpdateMessage =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = auth.user.access_token;
    const client = createClient(URI, accessToken);

    const mutation = gql`
      mutation CreateOrUpdateMessage(
        $codespace: String!
        $authority: String!
        $input: SituationElementInput!
      ) {
        createOrUpdateSituationElement(
          codespace: $codespace
          authority: $authority
          input: $input
        )
      }
    `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return client
      .mutate({ mutation, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getCancellations = (URI, auth) => async (codespace, authority) => {
  const accessToken = auth.user.access_token;
  const client = createClient(URI, accessToken);

  const query = gql`
    query CancellationsQuery($authority: String!, $codespace: String!) {
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
    }
  `;

  const variables = {
    codespace,
    authority,
  };

  return client
    .query({ query, variables })
    .catch((error) => error)
    .then((response) => response);
};

const createOrUpdateCancellation =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = auth.user.access_token;
    const client = createClient(URI, accessToken);

    const mutation = gql`
      mutation CreateOrUpdateCancellation(
        $codespace: String!
        $authority: String!
        $input: CancellationInput!
      ) {
        createOrUpdateCancellation(
          codespace: $codespace
          authority: $authority
          input: $input
        )
      }
    `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return client
      .mutate({ mutation, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getExtrajourneys =
  (URI, auth) => async (codespace, authority, showCompletedTrips) => {
    const accessToken = auth.user.access_token;
    const client = createClient(URI, accessToken);

    const query = gql`
      query ExtraJourneysQuery(
        $authority: String!
        $codespace: String!
        $showCompletedTrips: Boolean!
      ) {
        extrajourneys(
          authority: $authority
          codespace: $codespace
          showCompletedTrips: $showCompletedTrips
        ) {
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
      }
    `;

    const variables = {
      codespace,
      authority,
      showCompletedTrips,
    };

    return client
      .query({ query, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const createOrUpdateExtrajourney =
  (URI, auth) => async (codespace, authority, input) => {
    const accessToken = auth.user.access_token;
    const client = createClient(URI, accessToken);

    const mutation = gql`
      mutation CreateOrUpdateExtrajourney(
        $codespace: String!
        $authority: String!
        $input: ExtrajourneyInput!
      ) {
        createOrUpdateExtrajourney(
          codespace: $codespace
          authority: $authority
          input: $input
        )
      }
    `;

    const variables = {
      codespace,
      authority,
      input,
    };

    return client
      .mutate({ mutation, variables })
      .catch((error) => error)
      .then((response) => response);
  };

const getUserContext = (URI, auth) => async () => {
  const accessToken = auth.user.access_token;
  const client = createClient(URI, accessToken);

  const query = gql`
    query GetUserContext {
      userContext {
        allowedCodespaces {
          id
          permissions
        }
      }
    }
  `;

  return client
    .query({ query })
    .catch((error) => error)
    .then((response) => response);
};

const api = (config, auth) => ({
  getAuthorities: getAuthorities(config['journey-planner-api']),
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
