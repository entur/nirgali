import React, { useState } from 'react';
import { TextField } from '@entur/form';
import {
  HeaderCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@entur/table';
import { Contrast } from '@entur/layout';
import { PrimaryButton } from '@entur/button';
import { useSelectedOrganization } from '../../hooks/useSelectedOrganization';
import { Operator, useOperators } from '../../hooks/useOperators';
import { Call, VehicleMode } from './types';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';
import { TypedDropDown } from './TypedDropdown';
import { RegisterEstimatedCallRow } from './register-estimated-call-row';
import { mapExtraJourney } from './mapExtraJourney';

export const Register = () => {
  const selectedOrganization = useSelectedOrganization();
  const operators = useOperators();
  const [name, setName] = useState<string | undefined>();
  const [selectedMode, setSelectedMode] = useState<VehicleMode | undefined>();
  const [destinationDisplay, setDestinationDisplay] = useState<
    string | undefined
  >();
  const [selectedOperator, setSelectedOperator] = useState<
    Operator | undefined
  >();

  const [calls, setCalls] = useState<Call[]>([
    {
      boarding: true,
      alighting: false,
    },
    {
      boarding: false,
      alighting: true,
    },
  ]);

  const navigate = useNavigate();

  const codespace = selectedOrganization.split(':')[0];

  const submit = async () => {
    const extraJourney = mapExtraJourney({
      codespace,
      selectedMode,
      name,
      destinationDisplay,
      selectedOperator,
      calls,
    });

    const db = firebase.firestore();
    await db
      .collection(
        `codespaces/${codespace}/authorities/${selectedOrganization}/extrajourneys`,
      )
      .doc()
      .set(extraJourney);

    navigate('/ekstraavganger');
  };

  return (
    <>
      <h2 className="text-center text-white">Registrer ny ekstraavgang</h2>

      {/*Published line name*/}
      <TextField
        label="Navn"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />

      <TypedDropDown
        label="Mode"
        items={Object.values(VehicleMode).map((mode) => ({
          value: mode,
          label: `${mode}`,
        }))}
        selectedItem={
          selectedMode
            ? { value: selectedMode || '', label: `${selectedMode}` }
            : null
        }
        onChange={(mode) => setSelectedMode(mode)}
      />

      <br />

      <TextField
        label="Destinasjon"
        value={destinationDisplay}
        onChange={(e) => setDestinationDisplay(e.target.value)}
      />

      <br />

      <TypedDropDown
        label="Operator"
        items={() =>
          operators.map((operator) => ({
            value: operator,
            label: `${operator.name} (${operator.id})`,
          }))
        }
        selectedItem={
          selectedOperator
            ? {
                value: selectedOperator,
                label: `${selectedOperator.name} (${selectedOperator.id})`,
              }
            : null
        }
        onChange={(operator) => setSelectedOperator(operator)}
      />
      <br />

      <Contrast>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderCell>Platform (NSR-id)</HeaderCell>
              <HeaderCell>Av-/påstigning</HeaderCell>
              <HeaderCell>Ankomst</HeaderCell>
              <HeaderCell>Avgang</HeaderCell>
              <HeaderCell>{''}</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((call, i) => (
              <RegisterEstimatedCallRow
                key={i}
                call={call}
                isFirst={i === 0}
                isLast={i === calls.length - 1}
                onChange={(call: Call) => {
                  setCalls([...calls.slice(0, i), call, ...calls.slice(i + 1)]);
                }}
                onAdd={() =>
                  setCalls([
                    ...calls.slice(0, i + 1),
                    {
                      boarding: true,
                      alighting: true,
                    },
                    ...calls.slice(i + 1),
                  ])
                }
                mode={selectedMode}
              />
            ))}
          </TableBody>
        </Table>

        <br />

        <PrimaryButton onClick={() => submit()}>
          Opprett ekstraavgang
        </PrimaryButton>
      </Contrast>
    </>
  );
};
