import { Overview } from './overview';
import { Route, Routes } from 'react-router-dom';
import { Register } from './register';

export const ExtraJourneys = () => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="/ny" element={<Register />} />
  </Routes>
);
