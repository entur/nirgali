import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, userEvent } from '../../util/test-utils';
import StopPicker from './StopPicker';

const stops = [
  { id: 'q1', name: 'Jernbanetorget', stopPlace: { id: 'NSR:StopPlace:337' } },
  {
    id: 'q2',
    name: 'Nationaltheatret',
    stopPlace: { id: 'NSR:StopPlace:548' },
  },
];

const summaries = [
  {
    id: 'NSR:StopPlace:337',
    transportMode: 'tram',
    topographicPlaceName: 'Oslo',
  },
  {
    id: 'NSR:StopPlace:548',
    transportMode: 'rail',
    topographicPlaceName: 'Oslo',
  },
];

describe('StopPicker', () => {
  it('does not refetch when re-rendered with a stable api prop', async () => {
    const getStopPlaceSummaries = vi.fn().mockResolvedValue(summaries);
    const api = { getStopPlaceSummaries };

    const { rerender } = render(
      <StopPicker stops={stops} api={api} onChange={() => {}} />,
    );

    await waitFor(() => expect(getStopPlaceSummaries).toHaveBeenCalledTimes(1));

    rerender(<StopPicker stops={stops} api={api} onChange={() => {}} />);
    rerender(<StopPicker stops={stops} api={api} onChange={() => {}} />);

    expect(getStopPlaceSummaries).toHaveBeenCalledTimes(1);
  });

  it('does not refetch when stops is a new array with the same contents', async () => {
    const getStopPlaceSummaries = vi.fn().mockResolvedValue(summaries);
    const api = { getStopPlaceSummaries };

    const { rerender } = render(
      <StopPicker stops={stops} api={api} onChange={() => {}} />,
    );
    await waitFor(() => expect(getStopPlaceSummaries).toHaveBeenCalledTimes(1));

    rerender(<StopPicker stops={[...stops]} api={api} onChange={() => {}} />);

    expect(getStopPlaceSummaries).toHaveBeenCalledTimes(1);
  });

  it('requests each stop place id only once', async () => {
    const getStopPlaceSummaries = vi.fn().mockResolvedValue(summaries);
    const duplicated = [...stops, ...stops, ...stops];

    render(
      <StopPicker
        stops={duplicated}
        api={{ getStopPlaceSummaries }}
        onChange={() => {}}
      />,
    );

    await waitFor(() => expect(getStopPlaceSummaries).toHaveBeenCalledTimes(1));
    expect(getStopPlaceSummaries).toHaveBeenCalledWith([
      'NSR:StopPlace:337',
      'NSR:StopPlace:548',
    ]);
  });

  it('renders a label without the parenthetical when the name is missing', async () => {
    const getStopPlaceSummaries = vi.fn().mockResolvedValue([
      {
        id: 'NSR:StopPlace:337',
        transportMode: 'tram',
        topographicPlaceName: null,
      },
    ]);

    render(
      <StopPicker
        stops={[stops[0]]}
        api={{ getStopPlaceSummaries }}
        onChange={() => {}}
      />,
    );

    await waitFor(() => expect(getStopPlaceSummaries).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      await screen.findByRole('option', {
        name: 'Jernbanetorget - NSR:StopPlace:337 - tram',
      }),
    ).toBeInTheDocument();
  });
});
