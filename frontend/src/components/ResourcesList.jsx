import { useState } from 'react';
import './ResourcesList.css';

const ResourcesList = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = {
    "Emergency Shelters": [
      {
        name: "Open Door Mission - Respite and Recuperative Care Center (RRCC)",
        contact: "713-921-7520",
        population: "Adults 17+",
        services: "Medical respite care for individuals recovering from illness or injury"
      },
      {
        name: "Magnificat Houses Inc - Emergency Shelter",
        contact: "713-529-4231",
        population: "Single females, single males, homeless population 18+",
        services: "Emergency shelter, customized support, ID assistance, housing assessments"
      }
    ],
    "Veterans Services": [
      {
        name: "United States Veterans Initiative - Veterans Village",
        contact: "Latricia 832-226-4798",
        population: "Veterans only",
        services: "Case management, mental health support, employment services, housing assistance"
      }
    ],
    "Women & Family Services": [
      {
        name: "God's Lovely Butterflies Maternal Home",
        contact: "832-264-7491",
        population: "Pregnant mothers and single mothers, ages 16+",
        services: "Temporary housing, case management, government assistance, baby items"
      },
      {
        name: "Wellsprings Village",
        contact: "713-529-6559",
        population: "Women only, ages 25-45",
        services: "Emergency shelter, transitional housing, job readiness support"
      },
      {
        name: "Salvation Army - Family Residence Jones",
        contact: "713-650-6530",
        population: "Single women, families, transgender women, single fathers with children",
        services: "Emergency shelter, housing assessment, career help, case management"
      }
    ]
  };

  return (
    <div className="resources-modal">
      <div className="resources-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Houston Area Resources</h2>
        
        <div className="category-filters">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All Resources
          </button>
          {Object.keys(resources).map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="resources-list">
          {(selectedCategory === 'all' ? 
            Object.entries(resources).map(([category, items]) => (
              <div key={category}>
                <h3>{category}</h3>
                {items.map((resource, index) => (
                  <div key={index} className="resource-card">
                    <h4>{resource.name}</h4>
                    <p><strong>Contact:</strong> {resource.contact}</p>
                    <p><strong>Population:</strong> {resource.population}</p>
                    <p><strong>Services:</strong> {resource.services}</p>
                  </div>
                ))}
              </div>
            ))
            :
            <div>
              <h3>{selectedCategory}</h3>
              {resources[selectedCategory].map((resource, index) => (
                <div key={index} className="resource-card">
                  <h4>{resource.name}</h4>
                  <p><strong>Contact:</strong> {resource.contact}</p>
                  <p><strong>Population:</strong> {resource.population}</p>
                  <p><strong>Services:</strong> {resource.services}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesList; 