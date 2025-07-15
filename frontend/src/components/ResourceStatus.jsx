import React, { useState, useEffect } from 'react';
import './ResourceStatus.css';

const ResourceStatus = () => {
  const [resourceData, setResourceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResourceStatus();
  }, []);

  const fetchResourceStatus = async () => {
    try {
      const response = await fetch('/api/dashboard/resource-status');
      if (response.ok) {
        const data = await response.json();
        setResourceData(data.recent_resources || []);
      } else {
        throw new Error('Failed to fetch resource status');
      }
    } catch (error) {
      console.error('Error fetching resource status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'contacted': return 'fas fa-phone';
      case 'in_progress': return 'fas fa-spinner';
      case 'completed': return 'fas fa-check-circle';
      case 'declined': return 'fas fa-times-circle';
      case 'not_eligible': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-question-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'contacted': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'declined': return '#ef4444';
      case 'not_eligible': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'contacted': return 'Contacted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'declined': return 'Declined';
      case 'not_eligible': return 'Not Eligible';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="resource-status-widget">
        <div className="widget-header">
          <h3>
            <i className="fas fa-chart-line"></i>
            Resource Status
          </h3>
        </div>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resource-status-widget">
        <div className="widget-header">
          <h3>
            <i className="fas fa-chart-line"></i>
            Resource Status
          </h3>
        </div>
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="resource-status-widget">
      <div className="widget-header">
        <h3>
          <i className="fas fa-chart-line"></i>
          Resource Status
        </h3>
        <p>Recent client resource updates</p>
      </div>
      
      <div className="resource-status-list">
        {resourceData.length === 0 ? (
          <div className="no-resources">
            <i className="fas fa-inbox"></i>
            <p>No resources assigned yet</p>
          </div>
        ) : (
          resourceData.map((item, index) => (
            <div key={index} className="resource-status-item">
              <div className="client-info">
                <div className="client-name">{item.client_name}</div>
                <div className="resource-name">{item.resource_name}</div>
                <div className="organization">{item.organization}</div>
              </div>
              
              <div className="status-info">
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  <i className={getStatusIcon(item.status)}></i>
                  {getStatusText(item.status)}
                </div>
                <div className="last-updated">
                  {formatDate(item.last_updated)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResourceStatus; 