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

const returnRedOrGreenIcon = (param: ExtraJourney) => {
  if (
    param.EstimatedVehicleJourney.ExpiresAtEpochMs >
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
  const [extrajourneys, setExtraJourneys] = useState([]);
  const [showCompletedTrips, setShowCompletedTrips] = useState(false);

  const db = firebase.firestore();

  useEffect(() => {
    const codespace = selectedOrganization.split(':')[0];
    const authority = selectedOrganization;

    if (!codespace || !authority) {
      return;
    }

    let query: any = db.collection(
      `codespaces/${codespace}/authorities/${authority}/extrajourneys`,
    );

    if (!showCompletedTrips) {
      query = query.where(
        'EstimatedVehicleJourney.ExpiresAtEpochMs',
        '>',
        new Date().getTime(),
      );
    }

    const unsubscribeSnapshotListener = query.onSnapshot((querySnapshot: any) =>
      setExtraJourneys(
        querySnapshot.size > 0
          ? querySnapshot.docs.map((doc: any) => ({
              id: doc.id,
              data: doc.data(),
            }))
          : [],
      ),
    );

    return () => {
      if (unsubscribeSnapshotListener) {
        unsubscribeSnapshotListener();
      }
    };
  }, [selectedOrganization, db, showCompletedTrips]);

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
            {extrajourneys.map((extrajourney: { data: ExtraJourney }) => (
              <TableRow key={extrajourney.data.EstimatedVehicleJourney.EstimatedVehicleJourneyCode}>
                <DataCell>{returnRedOrGreenIcon(extrajourney.data)}</DataCell>
                <DataCell>
                  {extrajourney.data.EstimatedVehicleJourney.PublishedLineName}
                </DataCell>
                <DataCell>
                  {
                    extrajourney.data.EstimatedVehicleJourney
                      .EstimatedVehicleJourneyCode
                  }
                </DataCell>
                <DataCell>
                  {
                    extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                      .EstimatedCall[0].StopPointName
                  }
                </DataCell>
                <DataCell>
                  {new Date(
                    Date.parse(
                      extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                        .EstimatedCall[0].AimedDepartureTime!,
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
                    extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                      .EstimatedCall[
                      extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                        .EstimatedCall.length - 1
                    ].StopPointName
                  }
                </DataCell>
                <DataCell>
                  {new Date(
                    Date.parse(
                      extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                        .EstimatedCall[
                        extrajourney.data.EstimatedVehicleJourney.EstimatedCalls
                          .EstimatedCall.length - 1
                      ].AimedArrivalTime!,
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
