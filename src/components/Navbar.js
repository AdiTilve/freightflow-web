// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div style={navBarStyle}>
      <div style={logoStyle} onClick={() => navigate('/')}>
        FreightFlow
      </div>
      <div style={navCenterStyle}>
        <button style={navButtonStyle} onClick={() => navigate('/assignments')}>Assignments</button>
        <button style={navButtonStyle} onClick={() => navigate('/flights')}>Flights</button>
        <button style={navButtonStyle} onClick={() => navigate('/parking')}>Parking</button>
        <button style={navButtonStyle} onClick={() => navigate('/cargo')}>Cargo</button>
      </div>
      <div style={{ width: '100px' }}></div>
    </div>
  );
};

const navBarStyle = {
  backgroundColor: '#1A1A2E',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
};

const logoStyle = {
  color: '#FFFFFF',
  fontSize: '22px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const navCenterStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '140px',
  flex: 1
};

const navButtonStyle = {
  backgroundColor: 'transparent',
  color: '#FFFFFF',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: '500'
};

export default Navbar;