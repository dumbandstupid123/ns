import React, { useState, useEffect } from 'react';
import './RecentClients.css';

const RecentClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/recent-clients');
      const data = await response.json();

      if (response.ok) {
        setClients(data.clients);
      } else {
        throw new Error(data.error || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="recent-clients">
      <h1>Recent Clients</h1>
      
      <div className="clients-grid">
        {clients.map((client) => (
          <div key={client.id} className="client-card" onClick={() => setSelectedClient(client)}>
            <div className="client-header">
              <h3>{client.firstName} {client.lastName}</h3>
              <span className="client-date">Added: {formatDate(client.dateAdded)}</span>
            </div>
            
            <div className="client-info">
              <p><strong>DOB:</strong> {formatDate(client.dateOfBirth)}</p>
              <p><strong>Phone:</strong> {client.phoneNumber}</p>
              <p><strong>Housing Status:</strong> {client.housingStatus}</p>
            </div>

            <div className="client-footer">
              <button className="view-details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div className="client-modal" onClick={() => setSelectedClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedClient(null)}>&times;</button>
            
            <h2>{selectedClient.firstName} {selectedClient.lastName}</h2>
            
            <div className="client-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Date of Birth:</strong> {formatDate(selectedClient.dateOfBirth)}</p>
                <p><strong>Gender:</strong> {selectedClient.gender}</p>
                <p><strong>Primary Language:</strong> {selectedClient.primaryLanguage}</p>
                {selectedClient.interpreterNeeded && <p><em>Interpreter Needed</em></p>}
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> {selectedClient.phoneNumber}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Address:</strong> {selectedClient.address}</p>
                <p>{selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}</p>
              </div>

              <div className="detail-section">
                <h3>Emergency Contact</h3>
                <p><strong>Name:</strong> {selectedClient.emergencyContact.name}</p>
                <p><strong>Relationship:</strong> {selectedClient.emergencyContact.relationship}</p>
                <p><strong>Phone:</strong> {selectedClient.emergencyContact.phone}</p>
              </div>

              <div className="detail-section">
                <h3>Status Information</h3>
                <p><strong>Housing Status:</strong> {selectedClient.housingStatus}</p>
                <p><strong>Employment:</strong> {selectedClient.employmentStatus}</p>
                <p><strong>Monthly Income:</strong> ${selectedClient.income}</p>
                <p><strong>Household Size:</strong> {selectedClient.householdSize}</p>
              </div>

              <div className="detail-section">
                <h3>Health Information</h3>
                <div className="detail-item">
                  <h4>Presenting Issues</h4>
                  <p>{selectedClient.presentingIssues}</p>
                </div>
                <div className="detail-item">
                  <h4>Mental Health History</h4>
                  <p>{selectedClient.mentalHealthHistory}</p>
                </div>
                <div className="detail-item">
                  <h4>Current Medications</h4>
                  <p>{selectedClient.currentMedications}</p>
                </div>
                <div className="detail-item">
                  <h4>Allergies</h4>
                  <p>{selectedClient.allergies}</p>
                </div>
                <p><strong>Primary Care Physician:</strong> {selectedClient.primaryCarePhysician}</p>
              </div>

              <div className="detail-section">
                <h3>Insurance Information</h3>
                <p><strong>Provider:</strong> {selectedClient.insuranceInfo.provider}</p>
                <p><strong>Policy Number:</strong> {selectedClient.insuranceInfo.policyNumber}</p>
                <p><strong>Group Number:</strong> {selectedClient.insuranceInfo.groupNumber}</p>
              </div>

              <div className="detail-section">
                <h3>Additional Information</h3>
                <p><strong>Referral Source:</strong> {selectedClient.referralSource}</p>
                <div className="detail-item">
                  <h4>Notes</h4>
                  <p>{selectedClient.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentClients; 