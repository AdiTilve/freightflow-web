import React from 'react';

const HomePage = () => {
  return (
    <div style={pageStyle}>
      <div style={fadeInContainer}>
        <h1 style={headingStyle}>Welcome to FreightFlow Admin Panel</h1>
        <p style={paragraphStyle}>
          Use the navigation bar to manage Assignments, Flights, and Parking Bays.
        </p>
      </div>
    </div>
  );
};

// Fix: Add paddingTop instead of marginTop so background follows
const pageStyle = {
  backgroundColor: '#F2F2F2',
  minHeight: '100vh',
  paddingTop: '80px', // Adjust this to match your Navbar height
};

const fadeInContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  animation: 'fadeIn 1s ease-in-out',
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`, styleSheet.cssRules.length);

const headingStyle = {
  fontSize: '30px',
  color: '#1A1A2E',
  marginBottom: '12px',
};

const paragraphStyle = {
  fontSize: '16px',
  color: '#4A4A4A',
};

export default HomePage;