import React, { useEffect, useState } from 'react';
import { FaPlane, FaEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { connectWebSocket, sendUpdateFlight } from '../utils/websocket';

const FlightsPage = () => {
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);

  useEffect(() => {
    // Subscribe to WebSocket updates
    connectWebSocket({
      onUpdateFlight: (updatedFlight) => {
        console.log('WebSocket updated flight:', updatedFlight);
        setFlights(prev =>
          prev.map(f =>
            f.flightNumber === updatedFlight.flightNumber
              ? { ...f, ...updatedFlight }
              : f
          )
        );
      }
    });
  }, []);

  useEffect(() => {
    fetch('/flights')
      .then(res => res.json())
      .then(data => {
        setFlights(Object.values(data));
        setLoadingFlights(false);
      })
      .catch(err => {
        console.error('Error loading flights:', err);
        setLoadingFlights(false);
      });
  }, []);

  const handleEditClick = (flight) => {
    setEditingFlight({ ...flight });
    setShowEditModal(true);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditingFlight(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = () => {
    sendUpdateFlight(editingFlight); // Use WebSocket to update
    setShowEditModal(false);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headingRowStyle}>
          <h2 style={headingStyle}>
            <FaPlane style={iconStyle} /> Flights Overview
          </h2>
        </div>

        {loadingFlights ? (
          <p style={loadingStyle}>Loading flights...</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={tableHeaderStyle}>Flight #</th>
                  <th style={tableHeaderStyle}>Landing Time</th>
                  <th style={tableHeaderStyle}>State</th>
                  <th style={tableHeaderStyle}>Terminal</th>
                  <th style={tableHeaderStyle}>Airline</th>
                  <th style={tableHeaderStyle}>From</th>
                  <th style={tableHeaderStyle}>To</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f, i) => (
                  <tr key={f.flightNumber} style={{ backgroundColor: i % 2 === 0 ? '#FFF' : '#F3F6FB' }}>
                    <td style={tableCellStyle}>{f.flightNumber}</td>
                    <td style={tableCellStyle}>{new Date(f.landingTime).toLocaleString()}</td>
                    <td style={tableCellStyle}>{f.state}</td>
                    <td style={tableCellStyle}>{f.terminal}</td>
                    <td style={tableCellStyle}>{f.airlineName}</td>
                    <td style={tableCellStyle}>{f.arrivalAirport}</td>
                    <td style={tableCellStyle}>{f.destinationAirport}</td>
                    <td style={tableCellStyle}>
                      <FaEdit style={editIconStyle} onClick={() => handleEditClick(f)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingFlight && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Edit Flight</h3>
            {renderFlightForm(editingFlight, handleEditChange)}
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={handleEditSubmit} style={modalButton}>Save</button>
              <button onClick={() => setShowEditModal(false)} style={{ ...modalButton, backgroundColor: '#aaa' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const renderFlightForm = (data, handleChange) => (
  <>
    {['flightNumber', 'landingTime', 'state', 'terminal', 'airlineName', 'arrivalAirport', 'destinationAirport'].map(field => (
      <div key={field} style={formRow}>
        <label>{field}</label>
        <input name={field} value={data[field]} onChange={handleChange} />
      </div>
    ))}
  </>
);

// Styles
const pageStyle = { backgroundColor: '#F2F2F2', minHeight: '100vh' };
const containerStyle = { padding: 24, maxWidth: 1200, margin: '0 auto' };
const headingRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 };
const headingStyle = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 600, color: '#1A1A2E' };
const iconStyle = { fontSize: 22, color: '#2C3E50' };
const loadingStyle = { fontSize: 16, color: '#555' };
const tableWrapperStyle = { overflowX: 'auto', borderRadius: 8, boxShadow: '0 3px 6px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { backgroundColor: '#2C3E50', color: '#fff' };
const tableHeaderStyle = { padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 14 };
const tableCellStyle = { padding: 12, borderBottom: '1px solid #E0E0E0', fontSize: 14 };
const editIconStyle = { cursor: 'pointer', color: '#2980B9', marginRight: 12 };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { backgroundColor: '#fff', padding: 30, borderRadius: 12, width: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0px 5px 15px rgba(0,0,0,0.2)' };
const modalButton = { padding: '10px 18px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 };
const formRow = { marginBottom: 15, display: 'flex', flexDirection: 'column' };

export default FlightsPage;