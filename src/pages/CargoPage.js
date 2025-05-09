// src/pages/CargoPage.js
import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const stateColors = {
  AVAILABLE: '#2ECC71',
  RESERVED: '#F1C40F',
  IN_USE: '#E67E22',
  UNAVAILABLE: '#E74C3C',
};

const CargoPage = () => {
  const [cargoBays, setCargoBays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBay, setEditingBay] = useState(null);

  useEffect(() => {
    fetchCargoData();
  }, []);

  const fetchCargoData = () => {
    fetch('/cargo',
      {method: "GET",
        credentials: "omit"
      }
    )
      .then(res => res.json())
      .then(data => {
        const sorted = (Array.isArray(data) ? data : Object.values(data)).sort((a, b) => {
          const extractNumber = id => parseInt(id?.match(/\d+$/)?.[0] || '0', 10);
          return extractNumber(a.id) - extractNumber(b.id);
        });
        setCargoBays(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading cargo bays:', err);
        setLoading(false);
      });
  };

  const handleEditClick = (bay) => {
    setEditingBay({ ...bay });
    setShowEditModal(true);
  };

  const handleStateChange = (e) => {
    setEditingBay(prev => ({ ...prev, state: e.target.value }));
  };

  const handleEditSubmit = () => {
    const { id, state } = editingBay;
    const truckID = 'admin';

    let endpoint = '';
    if (state === 'RESERVED') {
      endpoint = `/cargo/${encodeURIComponent(id)}/${truckID}/reserve`;
    } else if (state === 'AVAILABLE') {
      endpoint = `/cargo/${encodeURIComponent(id)}/${truckID}/release`;
    }

    const finalize = () => {
      setShowEditModal(false);
      fetchCargoData();
    };

    if (endpoint) {
      const fullUrl = `https://freightflow-backend-343038966142.us-central1.run.app${endpoint}`;
      console.log('Sending POST request to:', fullUrl);

      fetch(fullUrl, { method: 'POST', credentials: 'omit'})
        .then(res => {
          if (!res.ok) throw new Error('Request failed');
          finalize();
        })
        .catch(err => {
          console.error(`Error updating cargo bay ${id}:`, err);
          finalize();
        });
    } else {
      finalize();
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2 style={headingStyle}>All Cargo Bays</h2>

        {loading ? (
          <p style={loadingStyle}>Loading cargo bays...</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={tableHeaderStyle}>Bay ID</th>
                  <th style={tableHeaderStyle}>State</th>
                  <th style={tableHeaderStyle}>Terminal</th>
                  <th style={tableHeaderStyle}>Latitude</th>
                  <th style={tableHeaderStyle}>Longitude</th>
                  <th style={tableHeaderStyle}>Truck ID</th>
                  <th style={tableHeaderStyle}>Arrive Time</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cargoBays.map((bay, i) => (
                  <tr key={bay.id || i} style={{ backgroundColor: i % 2 === 0 ? '#FFF' : '#F3F6FB' }}>
                    <td style={tableCellStyle}>{bay.id}</td>
                    <td style={{ ...tableCellStyle, fontWeight: 600, color: stateColors[bay.state] || '#000' }}>
                      {bay.state}
                    </td>
                    <td style={tableCellStyle}>{bay.terminal || '—'}</td>
                    <td style={tableCellStyle}>{bay.location?.latitude ?? '—'}</td>
                    <td style={tableCellStyle}>{bay.location?.longitude ?? '—'}</td>
                    <td style={tableCellStyle}>{bay.truckID || '—'}</td>
                    <td style={tableCellStyle}>
                      {bay.truckArriveTime > 0
                        ? new Date(bay.truckArriveTime).toLocaleString()
                        : '—'}
                    </td>
                    <td style={tableCellStyle}>
                      <FaEdit style={{ ...editIconStyle, cursor: 'pointer' }} onClick={() => handleEditClick(bay)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && editingBay && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Edit Cargo Bay</h3>
            <div style={formRow}>
              <label>Cargo Bay ID</label>
              <input value={editingBay.id} disabled />
            </div>
            <div style={formRow}>
              <label>State</label>
              <select value={editingBay.state} onChange={handleStateChange}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RESERVED">RESERVED</option>
                <option value="IN_USE">IN_USE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
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


const pageStyle = { backgroundColor: '#F2F2F2', minHeight: '100vh' };
const containerStyle = { padding: 24, maxWidth: 1200, margin: '0 auto' };
const headingStyle = { fontSize: 28, fontWeight: 600, color: '#1A1A2E', marginBottom: 16 };
const loadingStyle = { fontSize: 16, color: '#555' };
const tableWrapperStyle = { overflowX: 'auto', borderRadius: 8, boxShadow: '0 3px 6px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { backgroundColor: '#2C3E50', color: '#fff' };
const tableHeaderStyle = { padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 14 };
const tableCellStyle = { padding: 12, borderBottom: '1px solid #E0E0E0', fontSize: 14 };
const editIconStyle = { color: '#2980B9', fontSize: 16 };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { backgroundColor: '#fff', padding: 30, borderRadius: 12, width: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0px 5px 15px rgba(0,0,0,0.2)' };
const modalButton = { padding: '10px 18px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 };
const formRow = { marginBottom: 15, display: 'flex', flexDirection: 'column' };

export default CargoPage;