const transformSituationData =
  require('./transformSituationData').transformSituationData;

const assertKeyOrder = (expected, actual) => {
  Object.keys(expected).forEach((key, i) => {
    expect(Object.keys(actual)[i]).toEqual(key);
    if (expected[key] === Object(expected[key])) {
      assertKeyOrder(expected[key], actual[key]);
    }
  });
};

describe('transformSituationData', () => {
  test('line', () => {
    const raw = {
      Severity: 'normal',
      Affects: {
        Networks: {
          AffectedNetwork: { AffectedLine: { LineRef: 'SOF:Line:3501_69' } },
        },
      },
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test5' },
      Source: { SourceType: 'directReport' },
      ValidityPeriod: { StartTime: '2020-02-27T12:28:00+02:00' },
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:5',
      ReportType: 'incident',
      CreationTime: '2020-02-27T12:28:23.000+02:00',
      Progress: 'open',
    };

    const expected = {
      CreationTime: '2020-02-27T12:28:23.000+02:00',
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:5',
      Source: { SourceType: 'directReport' },
      Progress: 'open',
      ValidityPeriod: { StartTime: '2020-02-27T12:28:00+02:00' },
      UndefinedReason: {},
      Severity: 'normal',
      ReportType: 'incident',
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test5' },
      Affects: {
        Networks: {
          AffectedNetwork: { AffectedLine: { LineRef: 'SOF:Line:3501_69' } },
        },
      },
    };

    const actual = transformSituationData(raw);
    expect(actual).toEqual(expected);
    assertKeyOrder(actual, expected);
  });

  test('line with stop points', () => {
    const raw = {
      Severity: 'normal',
      Affects: {
        Networks: {
          AffectedNetwork: {
            AffectedLine: {
              Routes: {
                AffectedRoute: {
                  StopPoints: {
                    AffectedStopPoint: [
                      { StopPointRef: 'NSR:StopPlace:36682' },
                      { StopPointRef: 'NSR:StopPlace:36779' },
                    ],
                  },
                },
              },
              LineRef: 'SOF:Line:1069_69',
            },
          },
        },
      },
      Summary: {
        _attributes: { 'xml:lang': 'NO' },
        _text: 'Test linje med flere stopp v3',
      },
      Source: { SourceType: 'directReport' },
      ValidityPeriod: { StartTime: '2020-03-03T11:54:59.824Z' },
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:30',
      ReportType: 'incident',
      CreationTime: '2020-03-03T11:54:59.824Z',
      Progress: 'open',
    };

    const expected = {
      CreationTime: '2020-03-03T11:54:59.824Z',
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:30',
      Source: { SourceType: 'directReport' },
      Progress: 'open',
      ValidityPeriod: { StartTime: '2020-03-03T11:54:59.824Z' },
      UndefinedReason: {},
      Severity: 'normal',
      ReportType: 'incident',
      Summary: {
        _attributes: { 'xml:lang': 'NO' },
        _text: 'Test linje med flere stopp v3',
      },
      Affects: {
        Networks: {
          AffectedNetwork: {
            AffectedLine: {
              LineRef: 'SOF:Line:1069_69',
              Routes: {
                AffectedRoute: {
                  StopPoints: {
                    AffectedStopPoint: [
                      { StopPointRef: 'NSR:StopPlace:36682' },
                      { StopPointRef: 'NSR:StopPlace:36779' },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    };

    const actual = transformSituationData(raw);
    expect(actual).toEqual(expected);
    assertKeyOrder(actual, expected);
  });

  test('single stop point', () => {
    const raw = {
      Severity: 'normal',
      Affects: {
        StopPoints: {
          AffectedStopPoint: [{ StopPointRef: 'NSR:StopPlace:36928' }],
        },
      },
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Stopp melding' },
      SituationNumber: 'SOF:SituationNumber:23',
      ReportType: 'incident',
      Advice: { _attributes: { 'xml:lang': 'NO' }, _text: 'Velmenende råd' },
      Progress: 'open',
      Source: { SourceType: 'directReport' },
      ValidityPeriod: {
        StartTime: '2020-03-03T09:52:00+02:00',
        EndTime: '2020-03-25T09:52:00+02:00',
      },
      ParticipantRef: 'SOF',
      CreationTime: '2020-03-03T08:52:01.505Z',
      Description: { _attributes: { 'xml:lang': 'NO' }, _text: 'Dyper ut' },
    };

    const expected = {
      CreationTime: '2020-03-03T08:52:01.505Z',
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:23',
      Source: { SourceType: 'directReport' },
      Progress: 'open',
      ValidityPeriod: {
        StartTime: '2020-03-03T09:52:00+02:00',
        EndTime: '2020-03-25T09:52:00+02:00',
      },
      UndefinedReason: {},
      Severity: 'normal',
      ReportType: 'incident',
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Stopp melding' },
      Description: { _attributes: { 'xml:lang': 'NO' }, _text: 'Dyper ut' },
      Advice: { _attributes: { 'xml:lang': 'NO' }, _text: 'Velmenende råd' },
      Affects: {
        StopPoints: {
          AffectedStopPoint: [{ StopPointRef: 'NSR:StopPlace:36928' }],
        },
      },
    };

    const actual = transformSituationData(raw);
    expect(actual).toEqual(expected);
    assertKeyOrder(actual, expected);
  });

  test('multiple stop points', () => {
    const raw = {
      CreationTime: '2020-03-03T10:42:02.043Z',
      Progress: 'closed',
      Severity: 'normal',
      Affects: {
        StopPoints: {
          AffectedStopPoint: [
            { StopPointRef: 'NSR:StopPlace:36925' },
            { StopPointRef: 'NSR:StopPlace:36824' },
          ],
        },
      },
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test igjen' },
      Source: { SourceType: 'directReport' },
      ValidityPeriod: {
        StartTime: '2020-03-03T10:42:02.043Z',
        EndTime: '2020-03-03T16:42:46+02:00',
      },
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:27',
      ReportType: 'incident',
    };

    const expected = {
      CreationTime: '2020-03-03T10:42:02.043Z',
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:27',
      Source: { SourceType: 'directReport' },
      Progress: 'closed',
      ValidityPeriod: {
        StartTime: '2020-03-03T10:42:02.043Z',
        EndTime: '2020-03-03T16:42:46+02:00',
      },
      UndefinedReason: {},
      Severity: 'normal',
      ReportType: 'incident',
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test igjen' },
      Affects: {
        StopPoints: {
          AffectedStopPoint: [
            { StopPointRef: 'NSR:StopPlace:36925' },
            { StopPointRef: 'NSR:StopPlace:36824' },
          ],
        },
      },
    };

    const actual = transformSituationData(raw);
    expect(actual).toEqual(expected);
    assertKeyOrder(actual, expected);
  });

  test('departure', () => {
    const raw = {
      ValidityPeriod: {
        StartTime: '2020-03-18T23:00:00.000Z',
        EndTime: '2020-03-19T22:59:59.999Z',
      },
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:28',
      ReportType: 'incident',
      CreationTime: '2020-03-03T10:42:23.446Z',
      Progress: 'open',
      Severity: 'normal',
      Affects: {
        VehicleJourneys: {
          AffectedVehicleJourney: {
            FramedVehicleJourneyRef: {
              DataFrameRef: '2020-03-19',
              DatedVehicleJourneyRef: 'SOF:ServiceJourney:1000_33_2004_69',
            },
            Route: null,
          },
        },
      },
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test avgang' },
      Source: { SourceType: 'directReport' },
    };

    const expected = {
      CreationTime: '2020-03-03T10:42:23.446Z',
      ParticipantRef: 'SOF',
      SituationNumber: 'SOF:SituationNumber:28',
      Source: { SourceType: 'directReport' },
      Progress: 'open',
      ValidityPeriod: {
        StartTime: '2020-03-18T23:00:00.000Z',
        EndTime: '2020-03-19T22:59:59.999Z',
      },
      UndefinedReason: {},
      Severity: 'normal',
      ReportType: 'incident',
      Summary: { _attributes: { 'xml:lang': 'NO' }, _text: 'Test avgang' },
      Affects: {
        VehicleJourneys: {
          AffectedVehicleJourney: {
            FramedVehicleJourneyRef: {
              DataFrameRef: '2020-03-19',
              DatedVehicleJourneyRef: 'SOF:ServiceJourney:1000_33_2004_69',
            },
            Route: null,
          },
        },
      },
    };

    const actual = transformSituationData(raw);
    expect(actual).toEqual(expected);
    assertKeyOrder(actual, expected);
  });
});
