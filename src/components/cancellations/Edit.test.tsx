import { describe, it, expect, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { nb } from 'date-fns/locale/nb';
import { render, screen, waitFor, userEvent } from '../../util/test-utils';
import cancellationsReducer, {
  Cancellation,
  loadCancellations,
} from '../../reducers/cancellationsSlice';
import Edit from './Edit';

const organization = 'NSB:Authority:NSB';

const lines = [{ id: 'NSB:Line:L1', name: 'Linje 1', publicCode: 'L1' }];

const serviceJourney = {
  id: 'NSB:ServiceJourney:1',
  line: { id: 'NSB:Line:L1' },
  estimatedCalls: [
    {
      stopPositionInPattern: 0,
      quay: { id: 'Q:1', name: 'Oslo S', stopPlace: { id: 'NSR:StopPlace:1' } },
      aimedDepartureTime: '2026-01-01T10:00:00+01:00',
    },
    {
      stopPositionInPattern: 1,
      quay: { id: 'Q:2', name: 'Bergen', stopPlace: { id: 'NSR:StopPlace:2' } },
      aimedArrivalTime: '2026-01-01T11:00:00+01:00',
    },
  ],
  passingTimes: [
    {
      quay: { id: 'Q:1' },
      forBoarding: true,
      forAlighting: false,
      requestStop: false,
    },
    {
      quay: { id: 'Q:2' },
      forBoarding: false,
      forAlighting: true,
      requestStop: false,
    },
  ],
};

const buildCancellation = (
  journeyCancelled: boolean,
  cancelledCalls: boolean[],
): Cancellation => ({
  id: 'c1',
  estimatedVehicleJourney: {
    cancellation: journeyCancelled,
    lineRef: 'NSB:Line:L1',
    directionRef: '0',
    dataSource: 'NSB',
    estimatedVehicleJourneyCode: 'code',
    expiresAtEpochMs: 0,
    extraJourney: false,
    groupOfLinesRef: '',
    isCompleteStopSequence: true,
    monitored: true,
    operatorRef: '',
    publishedLineName: '',
    recordedAtTime: '2026-01-01T00:00:00.000Z',
    routeRef: '',
    vehicleMode: 'rail',
    estimatedCalls: {
      estimatedCall: cancelledCalls.map((cancelled, i) => ({
        stopPointRef: `Q:${i + 1}`,
        order: i + 1,
        cancellation: cancelled,
        arrivalStatus: cancelled ? 'cancelled' : 'onTime',
        departureStatus: cancelled ? 'cancelled' : 'onTime',
        arrivalBoardingActivity: 'noAlighting',
        departureBoardingActivity: 'noBoarding',
      })),
    },
    framedVehicleJourneyRef: {
      dataFrameRef: '2026-01-01',
      datedVehicleJourneyRef: 'NSB:ServiceJourney:1',
    },
  },
});

// Run the fixture through the real reducer so it is frozen exactly the way
// the Edit component receives it in the app (props come from Redux state).
const toReduxState = (cancellation: Cancellation): Cancellation[] =>
  cancellationsReducer(
    undefined,
    loadCancellations.fulfilled([cancellation], 'request-id', {
      config: {} as any,
      auth: {},
      codespace: 'NSB',
      authority: organization,
    }),
  ).data;

const renderEdit = (cancellation: Cancellation) => {
  const cancellations = toReduxState(cancellation);
  expect(Object.isFrozen(cancellations[0].estimatedVehicleJourney)).toBe(true);

  const api = {
    getServiceJourney: vi.fn().mockResolvedValue({ data: { serviceJourney } }),
    createOrUpdateCancellation: vi.fn().mockResolvedValue({}),
    getStopPlaceSummaries: vi.fn().mockResolvedValue([]),
  };
  const refetch = vi.fn().mockResolvedValue(undefined);

  render(
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nb}>
      <Routes>
        <Route
          path="/kanselleringer/:id"
          element={
            <Edit
              cancellations={cancellations}
              organization={organization}
              lines={lines}
              api={api}
              refetch={refetch}
            />
          }
        />
        <Route path="/kanselleringer" element={<div>Oversikt</div>} />
      </Routes>
    </LocalizationProvider>,
    { routerProps: { initialEntries: ['/kanselleringer/c1'] } },
  );

  return { api, refetch };
};

describe('cancellations Edit', () => {
  it('shows the restore button for a fully cancelled departure', async () => {
    renderEdit(buildCancellation(true, [true, true]));

    expect(
      await screen.findByRole('button', { name: 'Gjenopprett avgang' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Kanseller avgang' }),
    ).not.toBeInTheDocument();
  });

  it('shows the restore button for a partially cancelled departure', async () => {
    renderEdit(buildCancellation(false, [true, false]));

    expect(
      await screen.findByRole('button', { name: 'Gjenopprett avgang' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Kanseller avgang' }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Oslo S - Q:1')).toBeInTheDocument();
  });

  it('shows the cancel button when nothing is cancelled', async () => {
    renderEdit(buildCancellation(false, [false, false]));

    expect(
      await screen.findByRole('button', { name: 'Kanseller avgang' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Gjenopprett avgang' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['fully cancelled', buildCancellation(true, [true, true])],
    ['partially cancelled', buildCancellation(false, [true, false])],
  ])('restores a %s departure from frozen Redux state', async (_, input) => {
    const user = userEvent.setup();
    const { api, refetch } = renderEdit(input);

    await user.click(
      await screen.findByRole('button', { name: 'Gjenopprett avgang' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Gjenopprett' }),
    );

    await waitFor(() =>
      expect(api.createOrUpdateCancellation).toHaveBeenCalledTimes(1),
    );
    const [codespace, authority, sent] =
      api.createOrUpdateCancellation.mock.calls[0];
    expect(codespace).toBe('NSB');
    expect(authority).toBe(organization);
    expect(sent.estimatedVehicleJourney.cancellation).toBe(false);
    expect(
      sent.estimatedVehicleJourney.estimatedCalls.estimatedCall.every(
        (call: any) =>
          call.cancellation === false &&
          call.arrivalStatus === 'onTime' &&
          call.departureStatus === 'onTime',
      ),
    ).toBe(true);

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(await screen.findByText('Oversikt')).toBeInTheDocument();
  });

  it('cancels a departure from frozen Redux state', async () => {
    const user = userEvent.setup();
    const { api } = renderEdit(buildCancellation(false, [false, false]));

    await user.click(
      await screen.findByRole('button', { name: 'Kanseller avgang' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Kanseller' }));

    await waitFor(() =>
      expect(api.createOrUpdateCancellation).toHaveBeenCalledTimes(1),
    );
    const [, , sent] = api.createOrUpdateCancellation.mock.calls[0];
    expect(sent.estimatedVehicleJourney.cancellation).toBe(true);
    expect(
      sent.estimatedVehicleJourney.estimatedCalls.estimatedCall.every(
        (call: any) => call.cancellation === true,
      ),
    ).toBe(true);
  });
});
