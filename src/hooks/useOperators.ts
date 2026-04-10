import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';

export type Operator = {
  id: string;
  name: string;
};

const isNonFlexibleLine = (line: any) =>
  !line.flexibleLineType || line.flexibleLineType === 'fixed';

export const useOperators = (selectedOrganization: string) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const config = useConfig();

  useEffect(() => {
    const getOperators = async () => {
      const response = await api(config).getOperators();
      if (response.data) {
        setOperators(
          response.data.operators.filter((op: any) =>
            op.lines?.some(
              (line: any) =>
                isNonFlexibleLine(line) &&
                line.authority?.id === selectedOrganization,
            ),
          ),
        );
      }
    };
    getOperators();
  }, [config, selectedOrganization]);

  return operators;
};
