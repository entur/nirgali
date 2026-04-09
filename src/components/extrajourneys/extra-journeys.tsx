import { Overview } from './overview';
import { Route, Routes } from 'react-router-dom';
import { Register } from './register';
import { useSelectedOrganization } from '../../hooks/useSelectedOrganization';

export const ExtraJourneys = () => {
  const selectedOrganization = useSelectedOrganization();
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/ny" element={<Register key={selectedOrganization} />} />
    </Routes>
  );
};
