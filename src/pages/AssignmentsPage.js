import React, { useEffect, useState } from 'react';
import { FaTasks, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import {
  connectWebSocket,
  sendDeleteAssignment,
  sendCreateAssignment,
  sendUpdateAssignment
} from '../utils/websocket';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    assignmentNumber: '',
    cargoType: 'ELECTRONIC',
    priorityLevel: 'HIGH',
    assignmentType: 'PICKUP',
    flightStatus: 'ON_TIME',
    flightNumber: '',
    assignmentStatus: 'PENDING',
    user: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAssignments = assignments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assignments.length / itemsPerPage);

  useEffect(() => {
    connectWebSocket({
      onDelete: (deletedId) =>
        setAssignments(prev => prev.filter(a => a.assignmentNumber !== deletedId)),
      onCreate: (created) =>
        setAssignments(prev => [...prev, created]),
      onUpdate: (updated) =>
        setAssignments(prev =>
          prev.map(a =>
            a.assignmentNumber === updated.assignmentNumber ? updated : a
          )
        )
    });
  }, []);

  useEffect(() => {
    fetch('/api/assignments',
      {method: "GET",
        credentials: "omit"
      }
    )
      .then(res => res.json())
      .then(data => {
        setAssignments(Object.values(data));
        setLoadingAssignments(false);
      })
      .catch(err => {
        console.error('Error loading assignments:', err);
        setLoadingAssignments(false);
      });
  }, []);

  useEffect(() => {
    fetch('/flights',
      {method: "GET",
        credentials: "omit"
      }
    )
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

  const handleOpenAdd = () => {
    setNewAssignment({
      assignmentNumber: '',
      cargoType: 'ELECTRONIC',
      priorityLevel: 'HIGH',
      assignmentType: 'PICKUP',
      flightStatus: 'ON_TIME',
      flightNumber: '',
      assignmentStatus: 'PENDING',
      user: ''
    });
    setShowAddModal(true);
  };

  const handleAddChange = e => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = () => {
    const requiredFields = ['assignmentNumber', 'cargoType', 'priorityLevel', 'assignmentType', 'flightStatus', 'flightNumber', 'assignmentStatus', 'user'];
    for (const field of requiredFields) {
      if (!newAssignment[field]) {
        alert(`Field "${field}" cannot be empty`);
        return;
      }
    }

    sendCreateAssignment(newAssignment);
    setShowAddModal(false);
  };

  const handleEditClick = (assignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditingAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = () => {
    sendUpdateAssignment(editingAssignment);
    setShowEditModal(false);
  };

  const handleDeleteClick = id => {
    setToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    sendDeleteAssignment(toDeleteId);
    setShowDeleteModal(false);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headingRowStyle}>
          <h2 style={headingStyle}>
            <FaTasks style={iconStyle} /> Assignments Overview
          </h2>
          <button style={addButtonStyle} onClick={handleOpenAdd}>
            <FaPlus style={{ marginRight: '6px' }} /> Add Assignment
          </button>
        </div>

        {loadingAssignments ? (
          <p style={loadingStyle}>Loading assignments...</p>
        ) : (
          <>
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={tableHeaderStyle}>#</th>
                    <th style={tableHeaderStyle}>Cargo</th>
                    <th style={tableHeaderStyle}>Priority</th>
                    <th style={tableHeaderStyle}>Type</th>
                    <th style={tableHeaderStyle}>Flight Status</th>
                    <th style={tableHeaderStyle}>Flight #</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>User</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.map((a, i) => (
                    <tr
                      key={a.assignmentNumber}
                      style={{
                        backgroundColor: i % 2 === 0 ? '#FFF' : '#F3F6FB',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <td style={tableCellStyle}>{a.assignmentNumber}</td>
                      <td style={tableCellStyle}>{a.cargoType}</td>
                      <td style={tableCellStyle}>{a.priorityLevel}</td>
                      <td style={tableCellStyle}>{a.assignmentType}</td>
                      <td style={tableCellStyle}>{a.flightStatus}</td>
                      <td style={tableCellStyle}>{a.flightNumber}</td>
                      <td style={tableCellStyle}>{a.assignmentStatus}</td>
                      <td style={tableCellStyle}>{a.user}</td>
                      <td style={tableCellStyle}>
                        <FaEdit style={editIconStyle} onClick={() => handleEditClick(a)} />
                        <FaTrashAlt style={deleteIconStyle} onClick={() => handleDeleteClick(a.assignmentNumber)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {assignments.length > itemsPerPage && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: 10 }}
                >
                  Back
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      margin: '0 4px',
                      fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: 10 }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Add New Assignment</h3>
            {renderFormFields(newAssignment, handleAddChange, loadingFlights, flights)}
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={handleAddSubmit} style={modalButton}>Submit</button>
              <button onClick={() => setShowAddModal(false)} style={{ ...modalButton, backgroundColor: '#aaa' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAssignment && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Edit Assignment</h3>
            {renderFormFields(editingAssignment, handleEditChange, loadingFlights, flights, true)}
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={handleEditSubmit} style={modalButton}>Save</button>
              <button onClick={() => setShowEditModal(false)} style={{ ...modalButton, backgroundColor: '#aaa' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete assignment <strong>{toDeleteId}</strong>?</p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={confirmDelete} style={modalButton}>Delete</button>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...modalButton, backgroundColor: '#aaa' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to render form fields
const renderFormFields = (data, handleChange, loadingFlights, flights, isEdit = false) => (
  <>
    <div style={formRow}>
      <label>Assignment #</label>
      <input name="assignmentNumber" value={data.assignmentNumber} onChange={handleChange} disabled={isEdit} />
    </div>
    <div style={formRow}>
      <label>Cargo Type</label>
      <select name="cargoType" value={data.cargoType} onChange={handleChange}>
        <option value="ELECTRONIC">Electronic</option>
        <option value="CLOTHING">Clothing</option>
      </select>
    </div>
    <div style={formRow}>
      <label>Priority Level</label>
      <select name="priorityLevel" value={data.priorityLevel} onChange={handleChange}>
        <option value="HIGH">HIGH</option>
        <option value="GENERAL">GENERAL</option>
      </select>
    </div>
    <div style={formRow}>
      <label>Assignment Type</label>
      <select name="assignmentType" value={data.assignmentType} onChange={handleChange}>
        <option value="PICKUP">Pickup</option>
        <option value="DROP">Drop-off</option>
      </select>
    </div>
    <div style={formRow}>
      <label>Flight Status</label>
      <select name="flightStatus" value={data.flightStatus} onChange={handleChange}>
        <option value="ON_TIME">On Time</option>
        <option value="LANDED">Landed</option>
        <option value="DELAYED">Delayed</option>
      </select>
    </div>
    <div style={formRow}>
      <label>Flight Number</label>
      {loadingFlights ? (
        <p>Loading flights…</p>
      ) : (
        <select name="flightNumber" value={data.flightNumber} onChange={handleChange}>
          <option value="" disabled>Select flight</option>
          {flights.map(f => (
            <option key={f.flightNumber} value={f.flightNumber}>
              {f.flightNumber}
            </option>
          ))}
        </select>
      )}
    </div>
    <div style={formRow}>
      <label>Assignment Status</label>
      <select name="assignmentStatus" value={data.assignmentStatus} onChange={handleChange}>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>
    <div style={formRow}>
      <label>User</label>
      <input name="user" value={data.user} onChange={handleChange} />
    </div>
  </>
);

// —— STYLES ——
const pageStyle = { backgroundColor: '#F2F2F2', minHeight: '100vh' };
const containerStyle = { padding: 24, maxWidth: 1200, margin: '0 auto' };
const headingRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 };
const headingStyle = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 600, color: '#1A1A2E' };
const iconStyle = { fontSize: 22, color: '#2C3E50' };
const addButtonStyle = { backgroundColor: '#27AE60', color: '#fff', padding: '10px 16px', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' };
const loadingStyle = { fontSize: 16, color: '#555' };
const tableWrapperStyle = { overflowX: 'auto', borderRadius: 8, boxShadow: '0 3px 6px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { backgroundColor: '#2C3E50', color: '#fff' };
const tableHeaderStyle = { padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 14 };
const tableCellStyle = { padding: 12, borderBottom: '1px solid #E0E0E0', fontSize: 14 };
const editIconStyle = { cursor: 'pointer', color: '#2980B9', marginRight: 12 };
const deleteIconStyle = { cursor: 'pointer', color: '#C0392B' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { backgroundColor: '#fff', padding: 30, borderRadius: 12, width: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0px 5px 15px rgba(0,0,0,0.2)' };
const formRow = { marginBottom: 15, display: 'flex', flexDirection: 'column' };
const modalButton = { padding: '10px 18px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 };
export default AssignmentsPage;