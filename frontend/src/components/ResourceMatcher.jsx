import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourceMatcher.css';

const ResourceMatcher = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [resourceType, setResourceType] = useState('housing');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientDropdown && !event.target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClientDropdown]);

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

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setRecommendations(null);
    setError(null);
    setShowClientDropdown(false);
    setClientSearchTerm('');
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(clientSearchTerm.toLowerCase());
  });

  const handleResourceTypeChange = (type) => {
    setResourceType(type);
    setRecommendations(null);
    setError(null);
  };

  const handleMatchResources = async () => {
    if (!selectedClient) {
      setError('Please select a client first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/match-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_data: selectedClient,
          resource_type: resourceType,
        }),
      });
      if (response.ok) {
      const data = await response.json();
        setRecommendations(data.recommendations); // Extract the recommendations object
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to match resources');
      }
    } catch (error) {
      console.error('Error matching resources:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAddForClient = async (resource) => {
    if (!selectedClient) {
      setError('Please select a client first');
      return;
    }
    try {
      const resourceData = {
        id: resource.id,
        resource_name: resource.resource_name,
        organization: resource.organization,
        program_type: resource.program_type,
        contact: resource.contact,
        services: resource.services,
        category: resource.category || resourceType,
        ai_reasoning: recommendations?.recommendation_reason || "This resource is recommended based on the client's needs."
      };
      
      const response = await fetch(`/api/clients/${selectedClient.id}/add-resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Resource added to client portfolio successfully!');
        // Optionally refresh recommendations to show updated state
      } else {
        const errorData = await response.json();
        if (errorData.detail && errorData.detail.includes('already exists')) {
          alert('This resource is already in the client\'s portfolio.');
        } else {
          setError(errorData.detail || 'Failed to add resource to client');
        }
      }
    } catch (error) {
      console.error('Error adding resource to client:', error);
      setError('Failed to add resource to client');
    }
  };

  const extractEmailFromContact = (contact) => {
    if (!contact) return 'info@resource.org';
    const emailMatch = contact.match(/[\\w\\.-]+@[\\w\\.-]+\\.\\w+/);
    return emailMatch ? emailMatch[0] : 'info@resource.org';
  };

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
    return resource.program_type || 'Housing resource';
  };

  const handleLearnMore = (resource) => {
    console.log('Navigating to resource:', resource.resource_name);
    
    try {
      const encodedId = encodeURIComponent(resource.id);
      navigate(`/resource/${encodedId}`);
    } catch (error) {
      console.error('Error in handleLearnMore:', error);
      alert('Error navigating to resource: ' + error.message);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedClient || !recommendations) return;
    
    const userMessage = {
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const response = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          client_data: selectedClient,
          resource_type: resourceType,
          current_recommendations: recommendations.retrieved_recommendations,
          chat_history: chatMessages
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          type: 'ai',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.json();
        const errorMessage = {
          type: 'error',
          content: errorData.detail || 'Failed to get AI response',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = {
        type: 'error',
        content: 'Failed to connect to server',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const renderClientSummary = (client) => {
    if (!client) return null;
    const age = client.dateOfBirth ? new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear() : 'N/A';
    const concerns = client.needs || [];
    return (
      <div className="client-summary">
        <div className="client-basic-info">
          <h3>{client.firstName} {client.lastName}</h3>
          <div className="client-details">
            {age !== 'N/A' && <span>Age: {age}</span>}
            {client.gender && <span>Gender: {client.gender}</span>}
        </div>
        </div>
        {concerns.length > 0 && (
          <div className="client-concerns">
            <h4>Key Concerns:</h4>
            <div className="concern-tags">
              {concerns.map(concern => <span key={concern} className="concern-tag">{concern}</span>)}
            </div>
              </div>
            )}
          </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations || !recommendations.retrieved_recommendations || recommendations.retrieved_recommendations.length === 0) {
      return null;
    }
    return (
      <div className="recommendations-section">
        <div className="section-header">
          <h3>
            <i className="fas fa-lightbulb"></i>
            AI-Recommended Resources
          </h3>
        </div>
        
        {recommendations.recommendation_reason && (
          <div className="ai-reasoning-section">
            <div className="ai-reasoning-header">
              <i className="fas fa-robot"></i>
              <span>AI-Recommended Resources</span>
              </div>
            <div className="ai-reasoning-content">
              {recommendations.recommendation_reason}
            </div>
          </div>
        )}
        
        <div className="resources-grid">
          {recommendations.retrieved_recommendations.map((resource, index) => (
            <div key={resource.id || resource.resource_name} className="resource-card">
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
                  onClick={() => handleAddForClient(resource)}
              >
                  Add for Client
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChatInterface = () => {
    if (!recommendations || !recommendations.retrieved_recommendations || recommendations.retrieved_recommendations.length === 0) {
      return null;
  }

    return (
      <div className="chat-section">
        <div className="chat-header">
          <h3>
            <i className="fas fa-comments"></i>
            Ask Follow-up Questions
          </h3>
          <p>Get more specific guidance about these recommendations</p>
        </div>
        
        <div className="chat-messages">
          {chatMessages.length === 0 && (
            <div className="chat-welcome">
              <i className="fas fa-lightbulb"></i>
              <p>Ask me anything about these recommendations! For example:</p>
              <ul>
                <li>"What documents will my client need for the first resource?"</li>
                <li>"Which of these has the shortest wait time?"</li>
                <li>"Are there any income requirements I should know about?"</li>
              </ul>
            </div>
          )}
          
          {chatMessages.map((message, index) => (
            <div key={index} className={`chat-message ${message.type}`}>
              <div className="message-content">
                {message.type === 'user' && <i className="fas fa-user"></i>}
                {message.type === 'ai' && <i className="fas fa-robot"></i>}
                {message.type === 'error' && <i className="fas fa-exclamation-triangle"></i>}
                <div className="message-text">{message.content}</div>
              </div>
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {chatLoading && (
            <div className="chat-message ai loading">
              <div className="message-content">
                <i className="fas fa-robot"></i>
                <div className="message-text">
                  <i className="fas fa-spinner fa-spin"></i>
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-input-container">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleChatKeyPress}
            placeholder="Ask a follow-up question about these recommendations..."
            className="chat-input"
            rows="2"
            disabled={chatLoading}
          />
          <button
            onClick={handleSendChatMessage}
            disabled={!chatInput.trim() || chatLoading}
            className="chat-send-btn"
          >
            <i className="fas fa-paper-plane"></i>
            </button>
        </div>
      </div>
    );
  };

    return (
    <div className="resource-matcher">
      <div className="resource-matcher-header">
        <h1>
          <i className="fas fa-handshake"></i>
          Resource Matcher
        </h1>
        <p>AI-powered resource matching for your clients</p>
      </div>
      <div className="matcher-content">
        <div className="left-panel">
          <div className="section">
            <h2>Select Client</h2>
            <div className="client-selector">
              <div className="client-actions">
                <button
                  className="add-client-btn"
                  onClick={() => navigate('/add-client')}
                >
                  <i className="fas fa-plus"></i>
                  Add New Client
            </button>
          </div>
              
              <div className="client-dropdown-container">
                <div className="client-dropdown-header" onClick={() => setShowClientDropdown(!showClientDropdown)}>
                  {selectedClient ? (
                    <div className="selected-client-display">
                      <div className="client-avatar">
                        {selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}
        </div>
                      <div className="client-info">
                        <div className="client-name">{selectedClient.firstName} {selectedClient.lastName}</div>
                        <div className="client-meta">
                          {selectedClient.dateOfBirth && <span>Age: {new Date().getFullYear() - new Date(selectedClient.dateOfBirth).getFullYear()}</span>}
        </div>
                </div>
              </div>
                  ) : (
                    <div className="placeholder-text">
                      <i className="fas fa-user"></i>
                      Select a client...
                    </div>
                  )}
                  <i className={`fas fa-chevron-${showClientDropdown ? 'up' : 'down'} dropdown-arrow`}></i>
                </div>

                {showClientDropdown && (
                  <div className="client-dropdown-menu">
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
                    
                    <div className="client-dropdown-list">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className={`client-dropdown-item ${selectedClient?.id === client.id ? 'selected' : ''}`}
                            onClick={() => handleClientSelect(client)}
                          >
                            <div className="client-avatar">
                              {client.firstName?.[0]}{client.lastName?.[0]}
                    </div>
                            <div className="client-info">
                              <div className="client-name">{client.firstName} {client.lastName}</div>
                              <div className="client-meta">
                                {client.dateOfBirth && <span>Age: {new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear()}</span>}
                                {client.contactInfo?.phoneNumber && <span> • {client.contactInfo.phoneNumber}</span>}
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
                    </div>
                    
                    {clients.length === 0 && (
                      <div className="no-clients">
                        <i className="fas fa-users"></i>
                        <p>No clients found. Add a client to get started.</p>
                  </div>
                )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="section">
            <h2>Resource Type</h2>
            <div className="resource-type-selector">
              <button
                className={`resource-type-btn ${resourceType === 'housing' ? 'active' : ''}`}
                onClick={() => handleResourceTypeChange('housing')}
              >
                <i className="fas fa-home"></i>
                Housing
              </button>
              <button
                className={`resource-type-btn ${resourceType === 'food' ? 'active' : ''}`}
                onClick={() => handleResourceTypeChange('food')}
              >
                <i className="fas fa-utensils"></i>
                Food
              </button>
              <button
                className={`resource-type-btn ${resourceType === 'transportation' ? 'active' : ''}`}
                onClick={() => handleResourceTypeChange('transportation')}
              >
                <i className="fas fa-car"></i>
                Transportation
              </button>
            </div>
          </div>
          <div className="section">
            <button
              className="match-btn"
              onClick={handleMatchResources}
              disabled={!selectedClient || loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Matching...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  Match Resources
                </>
              )}
            </button>
          </div>
          
          {/* Chat Interface in Left Panel */}
          {recommendations && recommendations.retrieved_recommendations && recommendations.retrieved_recommendations.length > 0 && (
            <div className="section">
              {renderChatInterface()}
            </div>
          )}
        </div>
        
        <div className="right-panel">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          {selectedClient && (
            <div className="section">
              <h2>Selected Client</h2>
              {renderClientSummary(selectedClient)}
            </div>
          )}
          {/* All Resources in Right Panel */}
          {renderRecommendations()}
        </div>
        </div>
      </div>
    );
};

export default ResourceMatcher; 