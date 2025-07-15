import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RecentClients.css';
import { API_ENDPOINTS } from '../config';

const RecentClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clientResources, setClientResources] = useState({});
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResourceClient, setSelectedResourceClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RECENT_CLIENTS);
      const data = await response.json();

      if (response.ok) {
        setClients(data.clients);
        // Fetch resources for each client
        await fetchAllClientResources(data.clients);
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

  const fetchAllClientResources = async (clients) => {
    const resourcesData = {};
    for (const client of clients) {
      try {
        const response = await fetch(`/api/clients/${client.id}/resources`);
        if (response.ok) {
          const data = await response.json();
          resourcesData[client.id] = data.resources || [];
        }
      } catch (error) {
        console.error(`Error fetching resources for client ${client.id}:`, error);
        resourcesData[client.id] = [];
      }
    }
    setClientResources(resourcesData);
  };

  const fetchClientResources = async (clientId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/resources`);
      if (response.ok) {
        const data = await response.json();
        setClientResources(prev => ({
          ...prev,
          [clientId]: data.resources || []
        }));
        return data.resources || [];
      }
    } catch (error) {
      console.error(`Error fetching resources for client ${clientId}:`, error);
      return [];
    }
  };

  const updateResourceStatus = async (clientId, resourceId, newStatus, notes = '') => {
    try {
      const response = await fetch(`/api/clients/${clientId}/resources/${resourceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        }),
      });

      if (response.ok) {
        // Refresh client resources
        await fetchClientResources(clientId);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update resource status');
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
      setError(error.message);
      return false;
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_CLIENT(clientId), {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the client from the local state
        setClients(clients.filter(client => client.id !== clientId));
        setSelectedClient(null);
        setShowDeleteConfirm(false);
        setClientToDelete(null);
      } else {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error.message);
    }
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConcernsList = (concerns) => {
    if (!concerns) return [];
    return Object.entries(concerns)
      .filter(([key, value]) => value === true && key !== 'other')
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
      .map(str => str.charAt(0).toUpperCase() + str.slice(1));
  };

  const getStatusTags = (client) => {
    const tags = [];
    if (client.presentingConcerns?.housingInstability) tags.push('Housing');
    if (client.presentingConcerns?.foodInsecurity) tags.push('Food');
    if (client.presentingConcerns?.mentalHealth) tags.push('Mental Health');
    if (client.presentingConcerns?.substanceUse) tags.push('Substance Use');
    if (client.presentingConcerns?.domesticViolence) tags.push('DV');
    return tags;
  };

  const filteredClients = clients
    .filter(client => {
      const searchMatch = 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phoneNumber?.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === 'all') return searchMatch;
      if (filterStatus === 'housing') return searchMatch && client.presentingConcerns?.housingInstability;
      if (filterStatus === 'food') return searchMatch && client.presentingConcerns?.foodInsecurity;
      if (filterStatus === 'mental-health') return searchMatch && client.presentingConcerns?.mentalHealth;
      if (filterStatus === 'urgent') return searchMatch && (
        client.presentingConcerns?.domesticViolence || 
        client.riskAndSafety?.experiencingViolence ||
        !client.riskAndSafety?.safeInCurrentEnvironment
      );
      return searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'name') {
        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      }
      return 0;
    });

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div className="header-left">
          <h1>Client Management</h1>
          <p>{clients.length} total clients</p>
        </div>
        <div className="header-right">
          <Link to="/add-client" className="add-client-button">
            <i className="fas fa-plus"></i>
            Add New Client
          </Link>
        </div>
      </div>

      <div className="clients-stats">
        <div className="stat-item">
          <div className="stat-label">Urgent Cases</div>
          <div className="stat-value">
            {filteredClients.filter(client => 
              client.presentingConcerns?.domesticViolence || 
              client.riskAndSafety?.experiencingViolence ||
              !client.riskAndSafety?.safeInCurrentEnvironment
            ).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Housing Needs</div>
          <div className="stat-value">
            {filteredClients.filter(client => 
              client.presentingConcerns?.housingInstability
            ).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Food Insecurity</div>
          <div className="stat-value">
            {filteredClients.filter(client => 
              client.presentingConcerns?.foodInsecurity
            ).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Mental Health</div>
          <div className="stat-value">
            {filteredClients.filter(client => 
              client.presentingConcerns?.mentalHealth
            ).length}
          </div>
        </div>
      </div>

      <div className="clients-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Clients</option>
            <option value="urgent">Urgent Cases</option>
            <option value="housing">Housing Needs</option>
            <option value="food">Food Insecurity</option>
            <option value="mental-health">Mental Health</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      
      <div className="clients-grid">
        {filteredClients.map((client) => (
          <div key={client.id} className="client-card" onClick={() => setSelectedClient(client)}>
            <div className="client-header">
              <div className="client-name-section">
                <div className="client-avatar">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div>
              <h3>{client.firstName} {client.lastName}</h3>
                  <span className="client-date">Added: {formatDate(client.createdAt)}</span>
                </div>
              </div>
              {(client.presentingConcerns?.domesticViolence || 
                client.riskAndSafety?.experiencingViolence ||
                !client.riskAndSafety?.safeInCurrentEnvironment) && (
                <span className="status-tag status-urgent">
                  <i className="fas fa-exclamation-triangle"></i>
                  Urgent
                </span>
              )}
            </div>
            
            <div className="client-info">
              <p><strong>Date of Birth:</strong> {formatDate(client.dateOfBirth)}</p>
              <p><strong>Phone:</strong> {client.phoneNumber || 'Not provided'}</p>
              <p><strong>Email:</strong> {client.email || 'Not provided'}</p>
              <p><strong>Housing Status:</strong> {client.socialHistory?.housingStatus || 'Not specified'}</p>
            </div>

            <div className="status-tags">
              {getStatusTags(client).map(tag => (
                <span key={tag} className={`status-tag status-${tag.toLowerCase().replace(' ', '-')}`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="card-actions">
              <button className="view-details-btn" onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(client);
              }}>
                <i className="fas fa-user"></i>
                View Profile
              </button>
              <button className="view-resources-btn" onClick={(e) => {
                e.stopPropagation();
                setSelectedResourceClient(client);
                setShowResourceModal(true);
              }}>
                <i className="fas fa-list"></i>
                Resources ({clientResources[client.id]?.length || 0})
            </button>
            </div>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div className="client-modal" onClick={() => setSelectedClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedClient(null)}>&times;</button>
            
            <div className="modal-header">
              <div className="client-avatar large">
                {selectedClient.firstName[0]}{selectedClient.lastName[0]}
              </div>
              <div className="client-title">
            <h2>{selectedClient.firstName} {selectedClient.lastName}</h2>
                <p className="client-subtitle">Client since {formatDate(selectedClient.createdAt)}</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="delete-client-btn"
                  onClick={() => confirmDelete(selectedClient)}
                  title="Delete Client"
                >
                  <i className="fas fa-trash"></i>
                  Delete Client
                </button>
              </div>
            </div>
            
            <div className="client-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Date of Birth:</strong> {formatDate(selectedClient.dateOfBirth)}</p>
                <p><strong>Gender:</strong> {selectedClient.gender || 'Not specified'}</p>
                <p><strong>Preferred Language:</strong> {selectedClient.preferredLanguage || 'Not specified'}</p>
                {selectedClient.interpreterNeeded && <p><em>Interpreter Needed</em></p>}
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> {selectedClient.phoneNumber || 'Not provided'}</p>
                <p><strong>Email:</strong> {selectedClient.email || 'Not provided'}</p>
                <p><strong>Address:</strong> {selectedClient.address || 'Not provided'}</p>
                {selectedClient.city && selectedClient.state && (
                <p>{selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Presenting Concerns</h3>
                <div className="concerns-list">
                  {getConcernsList(selectedClient.presentingConcerns).map(concern => (
                    <span key={concern} className="concern-tag">{concern}</span>
                  ))}
                </div>
                {selectedClient.presentingConcerns?.otherDescription && (
                  <p className="other-concerns">
                    <strong>Other Concerns:</strong> {selectedClient.presentingConcerns.otherDescription}
                  </p>
                )}
              </div>

              <div className="detail-section">
                <h3>Risk Assessment</h3>
                <div className="risk-assessment-grid">
                  <div className={`risk-item ${selectedClient.riskAndSafety?.safeInCurrentEnvironment ? 'safe' : 'unsafe'}`}>
                    <i className={`fas fa-${selectedClient.riskAndSafety?.safeInCurrentEnvironment ? 'check' : 'times'}`}></i>
                    <span>Safe in Current Environment</span>
                  </div>
                  <div className={`risk-item ${!selectedClient.riskAndSafety?.experiencingViolence ? 'safe' : 'unsafe'}`}>
                    <i className={`fas fa-${!selectedClient.riskAndSafety?.experiencingViolence ? 'check' : 'times'}`}></i>
                    <span>No Current Violence</span>
                  </div>
                  <div className={`risk-item ${selectedClient.riskAndSafety?.accessToFood ? 'safe' : 'warning'}`}>
                    <i className={`fas fa-${selectedClient.riskAndSafety?.accessToFood ? 'check' : 'exclamation'}`}></i>
                    <span>Access to Food</span>
                  </div>
                  <div className={`risk-item ${selectedClient.riskAndSafety?.hasPrimaryCareProvider ? 'safe' : 'warning'}`}>
                    <i className={`fas fa-${selectedClient.riskAndSafety?.hasPrimaryCareProvider ? 'check' : 'exclamation'}`}></i>
                    <span>Has Primary Care</span>
                  </div>
                </div>
                
                {selectedClient.riskAndSafety?.childrenInHome && (
                  <div className="children-info">
                    <p><strong>Children in Home:</strong> Yes</p>
                    {selectedClient.riskAndSafety?.cpsConcerns && (
                      <p className="warning-text">CPS Concerns Noted</p>
                    )}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Social History</h3>
                <p><strong>Housing Status:</strong> {selectedClient.socialHistory?.housingStatus || 'Not specified'}</p>
                <p><strong>Employment:</strong> {selectedClient.socialHistory?.employmentStatus || 'Not specified'}</p>
                <p><strong>Education:</strong> {selectedClient.socialHistory?.educationLevel || 'Not specified'}</p>
                <p><strong>Household Members:</strong> {selectedClient.socialHistory?.householdMembers || 'Not specified'}</p>
                
                <div className="subsection">
                  <h4>Income Sources</h4>
                  <ul>
                    {selectedClient.socialHistory?.incomeSources?.employment && <li>Employment</li>}
                    {selectedClient.socialHistory?.incomeSources?.ssiSsdi && <li>SSI/SSDI</li>}
                    {selectedClient.socialHistory?.incomeSources?.tanf && <li>TANF</li>}
                    {selectedClient.socialHistory?.incomeSources?.none && <li>No Income</li>}
                  </ul>
                </div>
                
                <div className="subsection">
                  <h4>Health Insurance</h4>
                  <ul>
                    {selectedClient.socialHistory?.healthInsurance?.medicaid && <li>Medicaid</li>}
                    {selectedClient.socialHistory?.healthInsurance?.medicare && <li>Medicare</li>}
                    {selectedClient.socialHistory?.healthInsurance?.private && <li>Private Insurance</li>}
                    {selectedClient.socialHistory?.healthInsurance?.none && <li>No Insurance</li>}
                  </ul>
                </div>
              </div>

              <div className="detail-section">
                <h3>Consent Information</h3>
                <div className="consent-status">
                  <div className={`consent-item ${selectedClient.consent?.understoodConfidentiality ? 'active' : ''}`}>
                    <i className={`fas fa-${selectedClient.consent?.understoodConfidentiality ? 'check-circle' : 'times-circle'}`}></i>
                    <span>Confidentiality Acknowledged</span>
                  </div>
                  <div className={`consent-item ${selectedClient.consent?.consentToServices ? 'active' : ''}`}>
                    <i className={`fas fa-${selectedClient.consent?.consentToServices ? 'check-circle' : 'times-circle'}`}></i>
                    <span>Consent to Services</span>
                  </div>
              </div>
                <div className="signature-info">
                  <p><strong>Client Signature:</strong> {selectedClient.consent?.clientSignature || 'Not signed'}</p>
                  <p><strong>Signature Date:</strong> {formatDate(selectedClient.consent?.clientSignatureDate)}</p>
                  <p><strong>Staff Name:</strong> {selectedClient.consent?.staffName || 'Not provided'}</p>
                  <p><strong>Staff Signature:</strong> {selectedClient.consent?.staffSignature || 'Not signed'}</p>
                  <p><strong>Staff Signature Date:</strong> {formatDate(selectedClient.consent?.staffSignatureDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResourceModal && selectedResourceClient && (
        <div className="resource-modal" onClick={() => setShowResourceModal(false)}>
          <div className="modal-content resource-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowResourceModal(false)}>&times;</button>
            
            <div className="modal-header">
              <div className="client-avatar large">
                {selectedResourceClient.firstName[0]}{selectedResourceClient.lastName[0]}
              </div>
              <div className="client-title">
                <h2>{selectedResourceClient.firstName} {selectedResourceClient.lastName}</h2>
                <p className="client-subtitle">Client Resources</p>
              </div>
            </div>
            
            <div className="resources-content">
              {clientResources[selectedResourceClient.id]?.length > 0 ? (
                <div className="resources-list">
                  {clientResources[selectedResourceClient.id].map((resource, index) => (
                    <div key={index} className="resource-item">
                      <div className="resource-header">
                        <h4>{resource.organization}</h4>
                        <div className="resource-category">{resource.category}</div>
                      </div>
                      
                      <div className="resource-details">
                        <p><strong>Program:</strong> {resource.program_type}</p>
                        <p><strong>Contact:</strong> {resource.contact}</p>
                        <p><strong>Added:</strong> {new Date(resource.added_date).toLocaleDateString()}</p>
                        {resource.ai_reasoning && (
                          <p><strong>AI Reasoning:</strong> {resource.ai_reasoning}</p>
                        )}
                      </div>
                      
                      <div className="resource-status-section">
                        <div className="status-header">
                          <span>Status:</span>
                          <select 
                            value={resource.status} 
                            onChange={(e) => updateResourceStatus(selectedResourceClient.id, resource.resource_id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="declined">Declined</option>
                            <option value="not_eligible">Not Eligible</option>
                          </select>
                        </div>
                        
                        <div className="status-info">
                          <span className={`status-badge status-${resource.status}`}>
                            {resource.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="last-updated">
                            Last updated: {new Date(resource.last_updated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {resource.notes && (
                        <div className="resource-notes">
                          <strong>Notes:</strong> {resource.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-resources-message">
                  <i className="fas fa-inbox"></i>
                  <h3>No Resources Added</h3>
                  <p>This client hasn't been assigned any resources yet.</p>
                  <p>Use the Resource Matcher to find and add appropriate resources.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && clientToDelete && (
        <div className="delete-confirm-modal" onClick={cancelDelete}>
          <div className="delete-confirm-content" onClick={e => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Delete Client</h3>
            </div>
            <div className="delete-confirm-body">
              <p>Are you sure you want to delete <strong>{clientToDelete.firstName} {clientToDelete.lastName}</strong>?</p>
              <p className="warning-text">This action cannot be undone. All client data will be permanently removed.</p>
            </div>
            <div className="delete-confirm-actions">
              <button 
                className="cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDeleteClient(clientToDelete.id)}
              >
                <i className="fas fa-trash"></i>
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentClients; 