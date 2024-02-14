import { useCallback, useState } from 'react';
import { VariantType } from '@entur/form';
import { Call, VehicleMode } from './types';
import { Operator } from '../../hooks/useOperators';
import { getLocalTimeZone, now } from '@internationalized/date';

type ValidationInput = {
  name?: string;
  mode?: VehicleMode;
  destinationDisplay?: string;
  operator?: Operator;
  calls: Call[];
};

export type ValidationFeedback = {
  feedback: string;
  variant: VariantType;
};

export type CallValidationResult = {
  [key in keyof Call]?: ValidationFeedback;
};

export type ValidationResult = {
  [key in keyof ValidationInput]?: ValidationFeedback | CallValidationResult[];
};

const isBefore = (a?: string, b?: string) => {
  if (a && b) {
    return new Date(a) < new Date(b);
  } else {
    return false;
  }
};

export const useExtrajourneyValidation = (input: ValidationInput) => {
  const [result, setResult] = useState<ValidationResult>({});

  const validate = useCallback(() => {
    const tmpResult: ValidationResult = {};
    if (!input.name || input.name === '') {
      tmpResult.name = {
        feedback: 'Ekstravgangen må ha et navn',
        variant: 'error',
      };
    }

    if (!input.mode) {
      tmpResult.mode = {
        feedback: 'Du må velge en vehicle mode',
        variant: 'error',
      };
    }

    if (!input.destinationDisplay || input.destinationDisplay === '') {
      tmpResult.destinationDisplay = {
        feedback: 'Ekstraavgangen må ha en destinasjonstest',
        variant: 'error',
      };
    }

    if (!input.operator) {
      tmpResult.operator = {
        feedback: 'Ekstraavgangen må ha en gyldig operatør',
        variant: 'error',
      };
    }

    const callValidationResults = input.calls
      .map((call, i) => {
        const callResult: CallValidationResult = {};

        if (!call.quay) {
          callResult.quay = {
            feedback: 'Alle stopp må ha en plattform',
            variant: 'error',
          };
        }

        if (!call.alighting && !call.boarding) {
          callResult.alighting = {
            feedback: 'Alle stopp må tillate enten avstigning eller påstigning',
            variant: 'error',
          };
        }

        if (i !== 0 && !call.arrival) {
          callResult.arrival = {
            feedback: 'Stoppet må ha en ankomsttid',
            variant: 'error',
          };
        }

        if (i < input.calls.length - 1 && !call.departure) {
          callResult.departure = {
            feedback: 'Stoppet må ha en avgangstid',
            variant: 'error',
          };
        }

        if (i !== 0 && isBefore(call.arrival, input.calls[i - 1].departure)) {
          callResult.arrival = {
            feedback: 'Ankomst er før avgang på forrige stopp',
            variant: 'error',
          };
        }

        if (
          i === input.calls.length - 1 &&
          !isBefore(
            call.arrival,
            now(getLocalTimeZone()).add({ days: 7 }).toAbsoluteString(),
          )
        ) {
          callResult.arrival = {
            feedback:
              'Ankomst på siste stopp kan ikke være mer enn 7 dager frem',
            variant: 'error',
          };
        }

        if (Object.keys(callResult).length > 0) {
          return callResult;
        } else {
          return undefined;
        }
      })
      .filter((result) => result !== undefined);

    if (callValidationResults.length > 0) {
      tmpResult.calls = callValidationResults as CallValidationResult[];
    }

    setResult(tmpResult);

    return Object.keys(tmpResult).length === 0;
  }, [input]);

  return {
    result,
    validate,
  };
};
