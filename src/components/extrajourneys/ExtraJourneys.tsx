import { Overview } from './Overview';
import { Route, Routes } from 'react-router-dom';
import { Register } from './Register';

interface ExtraJourneysProps {
  selectedOrganization: string;
}

export const ExtraJourneys = ({ selectedOrganization }: ExtraJourneysProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Overview selectedOrganization={selectedOrganization} />}
      />
      <Route
        path="/ny"
        element={
          <Register
            key={selectedOrganization}
            selectedOrganization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
