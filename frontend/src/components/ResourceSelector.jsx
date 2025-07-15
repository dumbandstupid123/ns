import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourceSelector.css';

const ResourceSelector = () => {
  const navigate = useNavigate();

  const handleResourceTypeSelection = (resourceType) => {
    navigate(`/browse-resources?category=${encodeURIComponent(resourceType)}`);
  };

  const ResourceOptionCard = ({ icon, colorClass, title, description, stats, onClick }) => (
    <div className="resource-option" onClick={onClick}>
      <div className={`resource-icon ${colorClass}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="option-content">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="option-stats">
        {stats.map((stat, index) => (
          <span key={index}><i className={`fas ${stat.icon}`}></i>{stat.label}</span>
        ))}
      </div>
      <div className="option-arrow">
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );

  return (
    <div className="resource-selector">
      <div className="selector-header">
        <h1>Resource Center</h1>
        <p>Select a category to find the resources you need.</p>
      </div>

      <div className="resource-options">
        <ResourceOptionCard
          icon="fa-utensils"
          colorClass="food-icon"
          title="Food Resources"
          description="Food pantries, meal programs, and nutrition assistance."
          stats={[
            { icon: 'fa-map-marker-alt', label: '50+ Locations' },
            { icon: 'fa-globe-americas', label: 'Multiple Counties' },
          ]}
          onClick={() => handleResourceTypeSelection('Food Resources')}
        />
        <ResourceOptionCard
          icon="fa-home"
          colorClass="housing-icon"
          title="Housing Resources"
          description="Emergency shelters, transitional housing, and supportive housing."
          stats={[
            { icon: 'fa-building', label: '12+ Programs' },
            { icon: 'fa-bed', label: 'Various Types' },
          ]}
          onClick={() => handleResourceTypeSelection('Housing Resources')}
        />
        <ResourceOptionCard
          icon="fa-bus"
          colorClass="transport-icon"
          title="Transportation Services"
          description="Free rides, public transit discounts, and medical transportation."
          stats={[
            { icon: 'fa-wheelchair', label: 'ADA Accessible' },
            { icon: 'fa-user-md', label: 'Medical Transport' },
          ]}
          onClick={() => handleResourceTypeSelection('Transportation Services')}
        />
        <ResourceOptionCard
          icon="fa-layer-group"
          colorClass="all-icon"
          title="All Resources"
          description="Browse all available community resources in one comprehensive view."
          stats={[
            { icon: 'fa-list-ul', label: '80+ Resources' },
            { icon: 'fa-th-large', label: 'All Categories' },
          ]}
          onClick={() => navigate('/browse-resources')}
        />
      </div>

      <div className="quick-actions">
        <h3>Need Help Finding a Resource?</h3>
        <p>Our new AI-powered Resource Matcher can help you find the perfect resource for your client's needs.</p>
        <button className="primary-button" onClick={() => navigate('/resource-matcher')}>
          <i className="fas fa-magic"></i> Try the Resource Matcher
        </button>
      </div>
    </div>
  );
};

export default ResourceSelector; 