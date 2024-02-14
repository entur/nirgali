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
import { CallValidationResult, useExtrajourneyValidation } from './validate';

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

  const { result, validate } = useExtrajourneyValidation({
    name,
    mode: selectedMode,
    destinationDisplay,
    operator: selectedOperator,
    calls,
  });

  const codespace = selectedOrganization.split(':')[0];

  const submit = async () => {
    if (!validate()) {
      console.log('Did not validate correctly');
      console.log({ result });
      return;
    }
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

      <Contrast>
        <TextField
          {...result.name}
          label="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Contrast>

      <br />

      <Contrast>
        <TypedDropDown
          {...result.mode}
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
      </Contrast>

      <br />

      <Contrast>
        <TextField
          {...result.destinationDisplay}
          label="Destinasjon"
          value={destinationDisplay}
          onChange={(e) => setDestinationDisplay(e.target.value)}
        />
      </Contrast>

      <br />

      <Contrast>
        <TypedDropDown
          {...result.operator}
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
      </Contrast>
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
                validationResult={
                  result.calls
                    ? (result.calls as CallValidationResult[])[i]
                    : undefined
                }
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
