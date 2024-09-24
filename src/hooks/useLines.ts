import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';

export const useLines = (selectedOrganization: string) => {
  const [lines, setLines] = useState();
  const config = useConfig();

  useEffect(() => {
    const getLines = async () => {
      const response = await api(config).getLines(selectedOrganization);
      if (response.data) {
        setLines(response.data.lines.slice());
      } else {
        console.log('Could not find any lines for this organization');
      }
    };
    getLines();
  }, [selectedOrganization, config]);

  return lines;
};
