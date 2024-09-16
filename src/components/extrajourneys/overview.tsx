import { Contrast } from '@entur/layout';
import { SecondaryButton } from '@entur/button';
import { Switch } from '@entur/form';
import { useNavigate } from 'react-router-dom';
import { useSelectedOrganization } from '../../hooks/useSelectedOrganization';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import {
  DataCell,
  HeaderCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@entur/table';
import { getLocalTimeZone, now } from '@internationalized/date';

import { ExtraJourney } from './types';
// @ts-ignore
import green from '../../img/green.png';
// @ts-ignore
import red from '../../img/red.png';
import { useExtrajourneys } from '../../hooks/useExtrajourneys';

const returnRedOrGreenIcon = (param: ExtraJourney) => {
  if (
    param.estimatedVehicleJourney.expiresAtEpochMs >
    now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime()
  ) {
    return <img src={green} id="active" alt="" height="30" width="30" />;
  } else {
    return <img src={red} id="not_active" alt="" height="30" width="30" />;
  }
};

export const Overview = () => {
  const navigate = useNavigate();
  const selectedOrganization = useSelectedOrganization();
  const [showCompletedTrips, setShowCompletedTrips] = useState(false);

  const { extrajourneys } = useExtrajourneys(
    selectedOrganization.split(':')[0],
    selectedOrganization,
    showCompletedTrips,
  );

  return (
    <>
      <h2 className="text-center text-white">Oversikt</h2>;<br></br>
      <div>
        <Contrast>
          <SecondaryButton
            width="fluid"
            onClick={() => navigate('/ekstraavganger/ny')}
          >
            Ny ekstraavgang
          </SecondaryButton>
        </Contrast>
      </div>
      <br></br>
      <Contrast>
        <div style={{ padding: '0 .5em' }}>
          <Switch
            checked={showCompletedTrips}
            onChange={(e) => setShowCompletedTrips(e.target.checked)}
          >
            Vis passerte ekstraavganger
          </Switch>
        </div>
      </Contrast>
      <br></br>
      <Contrast>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Linje</HeaderCell>
              <HeaderCell>Tur</HeaderCell>
              <HeaderCell>Fra stasjon</HeaderCell>
              <HeaderCell>Planlagt avgang</HeaderCell>
              <HeaderCell>Til stasjon</HeaderCell>
              <HeaderCell>Planlagt ankomst</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {extrajourneys.map((extrajourney: ExtraJourney) => (
              <TableRow
                key={
                  extrajourney.estimatedVehicleJourney
                    .estimatedVehicleJourneyCode
                }
              >
                <DataCell>{returnRedOrGreenIcon(extrajourney)}</DataCell>
                <DataCell>
                  {extrajourney.estimatedVehicleJourney.publishedLineName}
                </DataCell>
                <DataCell>
                  {
                    extrajourney.estimatedVehicleJourney
                      .estimatedVehicleJourneyCode
                  }
                </DataCell>
                <DataCell>
                  {
                    extrajourney.estimatedVehicleJourney.estimatedCalls
                      .estimatedCall[0].stopPointName
                  }
                </DataCell>
                <DataCell>
                  {new Date(
                    Date.parse(
                      extrajourney.estimatedVehicleJourney.estimatedCalls
                        .estimatedCall[0].aimedDepartureTime!,
                    ),
                  ).toLocaleString(navigator.language, {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </DataCell>
                <DataCell>
                  {
                    extrajourney.estimatedVehicleJourney.estimatedCalls
                      .estimatedCall[
                      extrajourney.estimatedVehicleJourney.estimatedCalls
                        .estimatedCall.length - 1
                    ].stopPointName
                  }
                </DataCell>
                <DataCell>
                  {new Date(
                    Date.parse(
                      extrajourney.estimatedVehicleJourney.estimatedCalls
                        .estimatedCall[
                        extrajourney.estimatedVehicleJourney.estimatedCalls
                          .estimatedCall.length - 1
                      ].aimedArrivalTime!,
                    ),
                  ).toLocaleString(navigator.language, {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </DataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Contrast>
    </>
  );
};
