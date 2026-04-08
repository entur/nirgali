import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { JourneyPattern } from '../components/extrajourneys/types';

export const useJourneyPatterns = (lineId?: string) => {
  const [journeyPatterns, setJourneyPatterns] = useState<JourneyPattern[]>([]);
  const config = useConfig();

  useEffect(() => {
    if (!lineId) {
      setJourneyPatterns([]);
      return;
    }

    const fetchPatterns = async () => {
      const response = await api(config).getJourneyPatternsForLine(lineId);
      if (response.data?.line?.journeyPatterns) {
        setJourneyPatterns(structuredClone(response.data.line.journeyPatterns));
      } else {
        console.log('Could not find any journey patterns for this line');
        setJourneyPatterns([]);
      }
    };
    fetchPatterns();
  }, [lineId, config]);

  return journeyPatterns;
};
