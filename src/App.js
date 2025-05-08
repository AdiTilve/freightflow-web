import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // <-- global
import HomePage from './pages/HomePage';
import AssignmentsPage from './pages/AssignmentsPage';
import FlightsPage from './pages/FlightsPage';
import ParkingPage from './pages/ParkingPage';
import CargoPage from './pages/CargoPage';

function App() {
  return (
    <Router>
      <Navbar /> {/* Global navbar here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/cargo" element={<CargoPage />} />
      </Routes>
    </Router>
  );
}

export default App;