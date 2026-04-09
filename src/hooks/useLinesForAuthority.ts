import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { Line } from '../components/extrajourneys/types';

export const useLinesForAuthority = (selectedOrganization: string) => {
  const [lines, setLines] = useState<Line[]>([]);
  const config = useConfig();

  useEffect(() => {
    const fetchLines = async () => {
      const response =
        await api(config).getLinesForAuthority(selectedOrganization);
      if (response.data?.lines) {
        const filtered = response.data.lines.filter(
          (line: any) =>
            !line.flexibleLineType || line.flexibleLineType === 'fixed',
        );
        setLines(structuredClone(filtered));
      } else {
        console.log('Could not find any lines for this authority');
        setLines([]);
      }
    };
    fetchLines();
  }, [selectedOrganization, config]);

  return lines;
};
