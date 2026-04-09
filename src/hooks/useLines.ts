import { useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadLines } from '../actions/lines';

export const useLines = (selectedOrganization: string) => {
  const config = useConfig();
  const dispatch = useAppDispatch();
  const lines = useAppSelector((state) => state.lines);

  useEffect(() => {
    dispatch(loadLines(config, selectedOrganization));
  }, [dispatch, selectedOrganization, config]);

  return lines;
};
