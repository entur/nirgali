import { describe, it, expect } from 'vitest';
import {
  createNewIssue,
  createAffectsLine,
  createAffectsLineWithStops,
  createAffectsStop,
  createAffectsDeparture,
  createAffectsDepartureWithStops,
  getMessageType,
  addInfoLink,
} from './messageHelpers';

describe('messageHelpers', () => {
  describe('createNewIssue', () => {
    it('creates a basic issue with summary', () => {
      const date = { toAbsoluteString: () => '2024-01-01T00:00:00Z' };
      const issue = createNewIssue(
        'NSB:Authority:NSB',
        date,
        'incident',
        'Test summary',
        '',
        '',
      );

      expect(issue.participantRef).toBe('NSB');
      expect(issue.reportType).toBe('incident');
      expect(issue.summary.text).toBe('Test summary');
      expect(issue.description).toBeUndefined();
      expect(issue.advice).toBeUndefined();
    });

    it('includes description when non-empty', () => {
      const date = { toAbsoluteString: () => '2024-01-01T00:00:00Z' };
      const issue = createNewIssue(
        'NSB:Authority:NSB',
        date,
        'general',
        'Summary',
        'Description text',
        '',
      );

      expect(issue.description.text).toBe('Description text');
      expect(issue.advice).toBeUndefined();
    });

    it('includes advice when non-empty', () => {
      const date = { toAbsoluteString: () => '2024-01-01T00:00:00Z' };
      const issue = createNewIssue(
        'NSB:Authority:NSB',
        date,
        'general',
        'Summary',
        '',
        'Advice text',
      );

      expect(issue.advice.text).toBe('Advice text');
    });
  });

  describe('createAffectsLine', () => {
    it('creates line affects with lineRef', () => {
      const result = createAffectsLine('NSB:Line:123');
      expect(result.networks.affectedNetwork.affectedLine.lineRef).toBe(
        'NSB:Line:123',
      );
    });
  });

  describe('createAffectsLineWithStops', () => {
    it('creates line affects with stops', () => {
      const stops = [
        { value: 'NSR:StopPlace:1' },
        { value: 'NSR:StopPlace:2' },
      ];
      const result = createAffectsLineWithStops('NSB:Line:123', stops);
      const affectedStopPoints =
        result.networks.affectedNetwork.affectedLine.routes.affectedRoute
          .stopPoints.affectedStopPoint;
      expect(affectedStopPoints).toHaveLength(2);
      expect(affectedStopPoints[0].stopPointRef).toBe('NSR:StopPlace:1');
    });
  });

  describe('createAffectsStop', () => {
    it('creates stop affects', () => {
      const stops = [{ value: 'NSR:StopPlace:1' }];
      const result = createAffectsStop(stops);
      expect(result.stopPoints.affectedStopPoint[0].stopPointRef).toBe(
        'NSR:StopPlace:1',
      );
    });
  });

  describe('createAffectsDeparture', () => {
    it('creates departure affects without stops', () => {
      const result = createAffectsDeparture(
        { year: 2024, month: 1, day: 15 },
        'NSB:ServiceJourney:123',
      );
      expect(
        result.vehicleJourneys.affectedVehicleJourney.framedVehicleJourneyRef
          .datedVehicleJourneyRef,
      ).toBe('NSB:ServiceJourney:123');
      expect(result.vehicleJourneys.affectedVehicleJourney.route).toBeNull();
    });
  });

  describe('createAffectsDepartureWithStops', () => {
    it('creates departure affects with stops', () => {
      const stops = [{ value: 'NSR:StopPlace:1' }];
      const result = createAffectsDepartureWithStops(
        { year: 2024, month: 1, day: 15 },
        'NSB:ServiceJourney:123',
        stops,
      );
      expect(
        result.vehicleJourneys.affectedVehicleJourney.route.stopPoints
          .affectedStopPoint[0].stopPointRef,
      ).toBe('NSR:StopPlace:1');
    });
  });

  describe('getMessageType', () => {
    it('returns Linje for network affects', () => {
      expect(getMessageType({ networks: {} })).toBe('Linje');
    });

    it('returns Stopp for stopPoints affects', () => {
      expect(getMessageType({ stopPoints: {}, networks: null })).toBe('Stopp');
    });

    it('returns Avgang for vehicleJourneys affects', () => {
      expect(
        getMessageType({
          vehicleJourneys: {},
          networks: null,
          stopPoints: null,
        }),
      ).toBe('Avgang');
    });

    it('returns Error for null affects', () => {
      expect(getMessageType(null)).toBe('Error');
    });
  });

  describe('addInfoLink', () => {
    it('adds info link to issue', () => {
      const issue: any = {};
      addInfoLink(issue, { uri: 'https://example.com', label: 'More info' });
      expect(issue.infoLinks.infoLink.uri).toBe('https://example.com');
      expect(issue.infoLinks.infoLink.label).toBe('More info');
    });

    it('does not add info link when undefined', () => {
      const issue: any = {};
      addInfoLink(issue, undefined);
      expect(issue.infoLinks).toBeUndefined();
    });

    it('does not add info link when uri is empty', () => {
      const issue: any = {};
      addInfoLink(issue, { uri: '' });
      expect(issue.infoLinks).toBeUndefined();
    });
  });
});
