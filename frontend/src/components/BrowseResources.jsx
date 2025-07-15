import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BrowseResources.css';
import { API_ENDPOINTS } from '../config';

const BrowseResources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editedResource, setEditedResource] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Client selection states
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [addingResourceStatus, setAddingResourceStatus] = useState('');

  useEffect(() => {
    fetchResources();
    fetchClients();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showClientModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showClientModal]);

  // Handle URL parameters for pre-filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    if (category) {
      setSelectedType(decodeURIComponent(category));
    }
  }, [location.search]);

  const fetchResources = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_RESOURCES);
      const data = await response.json();

      if (response.ok) {
        setResources(data.resources);
      } else {
        throw new Error(data.error || 'Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/recent-clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleLearnMore = (resource) => {
    console.log('Navigating to resource:', resource.resource_name);
    const encodedId = encodeURIComponent(resource.id);
    navigate(`/resource/${encodedId}`);
  };

  const handleUpdateClick = (resource) => {
    setEditedResource({ ...resource });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus('Updating resource...');

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_RESOURCE(editedResource.resource_name), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedResource),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateStatus('Resource updated successfully!');
        // Update the resource in the local state
        const updatedResources = resources.map(r => 
          r.resource_name === editedResource.resource_name ? editedResource : r
        );
        setResources(updatedResources);
        setIsEditing(false);
        setEditedResource(null);
      } else {
        throw new Error(data.error || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      setUpdateStatus(`Error: ${error.message}`);
    }
  };

  const handleEditChange = (e, field, isArray = false) => {
    const { value } = e.target;
    
    if (isArray) {
      // Handle array fields like services and key_features
      const arrayValue = value.split('\n').filter(item => item.trim() !== '');
      setEditedResource(prev => ({
        ...prev,
        [field]: arrayValue
      }));
    } else if (field === 'eligibility.general') {
      // Handle nested eligibility field
      setEditedResource(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          general: value
        }
      }));
    } else {
      setEditedResource(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddForClient = (resource, e) => {
    e.stopPropagation();
    setSelectedResource(resource);
    setShowClientModal(true);
    setClientSearchTerm('');
  };

  const handleClientSelect = async (client) => {
    if (!selectedResource || !client) return;

    setAddingResourceStatus('Adding resource to client...');
    
    try {
      const resourceData = {
        id: selectedResource.id,
        resource_name: selectedResource.resource_name,
        organization: selectedResource.organization,
        program_type: selectedResource.program_type,
        contact: selectedResource.contact,
        services: selectedResource.services,
        category: selectedResource.category || 'housing',
        ai_reasoning: `Added from Resource Center browse - ${selectedResource.organization} offers ${selectedResource.program_type}`
      };
      
      const response = await fetch(`/api/clients/${client.id}/add-resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });
      
      if (response.ok) {
        setAddingResourceStatus('✅ Resource added successfully!');
        setTimeout(() => {
          setShowClientModal(false);
          setSelectedResource(null);
          setAddingResourceStatus('');
        }, 2000);
      } else {
        const errorData = await response.json();
        if (errorData.detail && errorData.detail.includes('already exists')) {
          setAddingResourceStatus('ℹ️ Resource already in client portfolio');
        } else {
          throw new Error(errorData.detail || 'Failed to add resource to client');
        }
        setTimeout(() => {
          setAddingResourceStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding resource to client:', error);
      setAddingResourceStatus(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setAddingResourceStatus('');
      }, 5000);
    }
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(clientSearchTerm.toLowerCase());
  });

  // Helper function to create a short description from available data
  const getShortDescription = (resource) => {
    if (resource.services && typeof resource.services === 'string' && resource.services.trim()) {
      return resource.services.length > 100 ? resource.services.substring(0, 100) + '...' : resource.services;
    }
    if (resource.services && Array.isArray(resource.services) && resource.services.length > 0) {
      const firstService = resource.services[0];
      return firstService.length > 100 ? firstService.substring(0, 100) + '...' : firstService;
    }
    if (resource.target_population) {
      return `Services for: ${resource.target_population}`;
    }
    return resource.program_type || 'Community resource';
  };

  // Filter and categorize resources
  const categories = ['All', 'Food Resources', 'Housing Resources', 'Transportation Services'];
  
  const categorizeResource = (resource) => {
    const category = resource.category?.toLowerCase() || '';
    const programType = resource.program_type?.toLowerCase() || '';
    const services = resource.services?.toLowerCase() || '';
    
    if (category === 'food' || programType.includes('food') || programType.includes('meal') || programType.includes('pantry')) {
      return 'Food Resources';
    } else if (category === 'transportation' || programType.includes('transport') || programType.includes('ride')) {
      return 'Transportation Services';
    } else {
      return 'Housing Resources';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.program_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.services?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || categorizeResource(resource) === selectedType;
    
    return matchesSearch && matchesType;
  });

  const groupedResources = categories.reduce((acc, category) => {
    if (category === 'All') return acc;
    acc[category] = filteredResources.filter(resource => categorizeResource(resource) === category);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="browse-resources">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-resources">
        <div className="error-state">
          <i className="fas fa-exclamation-circle"></i>
          <p>Error loading resources: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-resources">
      <div className="page-header">
        <div className="header-top">
          <button 
            className="back-to-selector-btn"
            onClick={() => navigate('/resource-selector')}
          >
            ← Back to Resource Center
          </button>
        </div>
        <div className="filters-section">
          <h1>Community Resources</h1>
          <div className="filters">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="type-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search resources by name, type, or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>
            {selectedType === 'All' ? 'All Resources' : selectedType}
            <span className="results-count">({filteredResources.length} found)</span>
          </h2>
        </div>

        {filteredResources.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No resources found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        ) : selectedType === 'All' ? (
          // Show grouped by category when "All" is selected
          Object.entries(groupedResources).map(([category, categoryResources]) => (
            categoryResources.length > 0 && (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
                <div className="resources-grid">
                  {categoryResources.map((resource) => (
                    <div
                      key={resource.id || resource.resource_name}
                      className="resource-card"
                    >
                      <div className="card-header">
                        <h3>{resource.organization || 'Unknown Organization'}</h3>
                        <span className={`resource-type ${resource.program_type?.replace(/\s+/g, '')}`}>
                          {resource.program_type || 'Housing'}
                        </span>
                      </div>
                      
                      <div className="card-body">
                        <p className="resource-description">{getShortDescription(resource)}</p>
                        
                        <div className="resource-info">
                          {resource.contact && (
                            <p><strong>Contact:</strong> {resource.contact}</p>
                          )}
                        </div>

                        {resource.incomplete && (
                          <div className="incomplete-badge">⚠️ Incomplete Entry</div>
                        )}
                      </div>

                      <div className="card-footer">
                        <button 
                          className="learn-more-btn"
                          onClick={() => handleLearnMore(resource)}
                        >
                          Learn More
                        </button>
                        <button 
                          className="add-client-btn"
                          onClick={(e) => handleAddForClient(resource, e)}
                        >
                          Add for Client
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        ) : (
          // Show filtered category
          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <div
                key={resource.id || resource.resource_name}
                className="resource-card"
              >
                <div className="card-header">
                  <h3>{resource.organization || 'Unknown Organization'}</h3>
                  <span className={`resource-type ${resource.program_type?.replace(/\s+/g, '')}`}>
                    {resource.program_type || 'Housing'}
                  </span>
                </div>
                
                <div className="card-body">
                  <p className="resource-description">{getShortDescription(resource)}</p>
                  
                  <div className="resource-info">
                    {resource.contact && (
                      <p><strong>Contact:</strong> {resource.contact}</p>
                    )}
                  </div>

                  {resource.incomplete && (
                    <div className="incomplete-badge">⚠️ Incomplete Entry</div>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    className="learn-more-btn"
                    onClick={() => handleLearnMore(resource)}
                  >
                    Learn More
                  </button>
                  <button 
                    className="add-client-btn"
                    onClick={(e) => handleAddForClient(resource, e)}
                  >
                    Add for Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Selection Modal */}
      {showClientModal && (
        <div 
          className="client-modal-overlay" 
          onClick={() => setShowClientModal(false)}
        >
          <div 
            className="client-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="client-modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Add Resource for Client
              </h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowClientModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="client-modal-body">
              {selectedResource && (
                <div className="selected-resource-info">
                  <h4>{selectedResource.organization}</h4>
                  <p>{selectedResource.program_type}</p>
                </div>
              )}
              
              <div className="client-search">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="client-search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              
              <div className="client-list">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="client-item"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="client-avatar">
                        {client.firstName?.[0]}{client.lastName?.[0]}
                      </div>
                      <div className="client-info">
                        <div className="client-name">{client.firstName} {client.lastName}</div>
                        <div className="client-meta">
                          {client.dateOfBirth && (
                            <span>Age: {new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear()}</span>
                          )}
                          {client.contactInfo?.phoneNumber && (
                            <span> • {client.contactInfo.phoneNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-clients-found">
                    <i className="fas fa-search"></i>
                    <p>No clients found matching "{clientSearchTerm}"</p>
                  </div>
                )}
                
                {clients.length === 0 && (
                  <div className="no-clients">
                    <i className="fas fa-users"></i>
                    <p>No clients found. Add a client to get started.</p>
                    <button 
                      className="add-client-btn"
                      onClick={() => navigate('/add-client')}
                    >
                      <i className="fas fa-plus"></i>
                      Add New Client
                    </button>
                  </div>
                )}
              </div>
              
              {addingResourceStatus && (
                <div className={`status-message ${addingResourceStatus.includes('✅') ? 'success' : addingResourceStatus.includes('ℹ️') ? 'info' : 'error'}`}>
                  {addingResourceStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseResources; 