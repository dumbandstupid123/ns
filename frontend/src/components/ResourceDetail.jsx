import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResourceDetail.css';

const ResourceDetail = () => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { resourceId } = useParams();

  useEffect(() => {
    const fetchResource = async () => {
      try {
                setLoading(true);
                const response = await fetch('/api/resources');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
                if (!data.resources || !Array.isArray(data.resources)) throw new Error('Invalid API response format');
                
                const decodedId = decodeURIComponent(resourceId);
                const foundResource = data.resources.find(r => r.id === decodedId || r.resource_name === decodedId);
          
          if (foundResource) {
            setResource(foundResource);
          } else {
                    setError(`Resource not found with ID: ${decodedId}`);
        }
            } catch (e) {
                console.error('Error fetching resource:', e);
                setError(`Failed to load resource: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
        if (resourceId) fetchResource();
  }, [resourceId]);

    const handleBack = () => navigate(-1);

    const renderDetail = (icon, label, value) => {
        if (!value || value === 'Not specified' || value === 'Not listed' || value === 'Not applicable') return null;
    return (
            <div className="detail-item">
                <i className={`detail-icon ${icon}`}></i>
                <div className="detail-content">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
        </div>
      </div>
    );
    };

    const renderDetailAlways = (icon, label, value) => {
    return (
            <div className="detail-item">
                <i className={`detail-icon ${icon}`}></i>
                <div className="detail-content">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value || 'Not specified'}</span>
        </div>
      </div>
    );
    };

    if (loading) return <div className="detail-loading">Loading...</div>;
    if (error) return <div className="detail-error">Error: {error}</div>;
    if (!resource) return <div className="detail-error">Resource not found.</div>;

  return (
        <div className="resource-detail-pro">
            <header className="detail-header-pro">
                <button onClick={handleBack} className="back-button-pro">
                    <i className="fas fa-arrow-left"></i>
                    <span>Back</span>
          </button>
            </header>

            <div className="detail-title-section">
                <div className="title-content">
                    <div className="program-type-pro">{resource.program_type}</div>
                    <h1>{resource.organization}</h1>
                    <p className="resource-name-pro">{resource.resource_name}</p>
          </div>
        </div>

            <main className="detail-main-content">
                <div className="detail-left-column">
                    {/* Key Information Card */}
                    <div className="detail-card key-info-card">
                        <div className="card-header">
                            <h2>Key Information</h2>
              </div>
                        <div className="key-info-grid">
                            {renderDetail('fas fa-building', 'Organization', resource.organization)}
                            {renderDetail('fas fa-tag', 'Program Type', resource.program_type)}
                            {renderDetail('fas fa-clock', 'Hours', resource.hours || resource.intake_hours)}
                            {renderDetail('fas fa-globe', 'Languages', resource.languages)}
                            {renderDetail('fas fa-calendar-alt', 'Available Days', resource.available_days)}
                            {renderDetail('fas fa-envelope', 'Email', resource.email)}
                            {renderDetail('fas fa-globe-americas', 'Website', resource.website)}
                            {renderDetail('fas fa-map-marker-alt', 'Area of Service', resource.area_of_service)}
          </div>
          </div>

                    {/* Services Card */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h2><i className="fas fa-hands-helping"></i> Services Offered</h2>
                        </div>
                        <p className="services-pro">{resource.services}</p>
                        {resource.transportation_type && (
                            <div className="transportation-details">
                                <h3>Transportation Details</h3>
                                <p><strong>Transportation Type:</strong> {resource.transportation_type}</p>
                    </div>
                  )}
                        {resource.amenities && (
                            <div className="amenities-details">
                                <h3>Amenities</h3>
                                <p>{resource.amenities}</p>
                    </div>
                  )}
                    </div>
                    
                    {/* Target Population & Eligibility Card */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h2><i className="fas fa-users"></i> Target Population & Eligibility</h2>
                        </div>
                        <div className="eligibility-grid">
                            {renderDetail('fas fa-bullseye', 'Target Population', resource.target_population)}
                            {renderDetail('fas fa-birthday-cake', 'Age Group', resource.age_group)}
                            {renderDetail('fas fa-check', 'Eligibility Requirements', resource.eligibility)}
                            {renderDetailAlways('fas fa-passport', 'Immigration Status', resource.immigration_status)}
                            {renderDetailAlways('fas fa-gavel', 'Criminal History', resource.criminal_history)}
                            {renderDetail('fas fa-wheelchair', 'Disability Requirements', resource.disability)}
                            {renderDetail('fas fa-briefcase', 'Work Requirements', resource.work_requirement)}
                            {renderDetail('fas fa-pills', 'Substance Use', resource.substance_use)}
                            {renderDetail('fas fa-brain', 'Mental Health', resource.mental_health)}
                        </div>
                    </div>

                    {/* Documentation & Requirements Card */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h2><i className="fas fa-file-alt"></i> Documentation & Requirements</h2>
                        </div>
                        <div className="intake-grid">
                            {renderDetail('fas fa-file-alt', 'Documentation Required', resource.documentation_required || resource.documentation || resource.basic_documents)}
                            {renderDetail('fas fa-id-card', 'ID Requirements', resource.id_requirements)}
                            {renderDetailAlways('fas fa-id-badge', 'Accepts Clients Without ID', resource.accepts_clients_without_id)}
                            {renderDetail('fas fa-shield-alt', 'Proof of Disability Required', resource.proof_of_disability_required)}
                            {renderDetailAlways('fas fa-medkit', 'Insurance Required', resource.insurance_required)}
                            {renderDetailAlways('fas fa-heart', 'Accepts Medicaid', resource.accepts_medicaid)}
                </div>
              </div>

                    {/* Intake Process & Booking Card */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h2><i className="fas fa-clipboard-list"></i> Intake Process & Booking</h2>
                  </div>
                        <div className="intake-grid">
                            {renderDetail('fas fa-walking', 'Process', resource.process)}
                            {renderDetail('fas fa-clock', 'Intake Hours', resource.intake_hours)}
                            {renderDetail('far fa-clock', 'Intake Duration', resource.intake_duration)}
                            {renderDetail('fas fa-calendar-day', 'Same Day Service', resource.same_day)}
                            {renderDetailAlways('fas fa-calendar-plus', 'Advance Booking Required', resource.advance_booking_required)}
                            {renderDetail('fas fa-phone', 'Booking Method', resource.booking_method)}
                            {renderDetail('fas fa-user-plus', 'Referral Method', resource.referral_method)}
                  </div>
              </div>

                    {/* Transportation Specific Card */}
                    {resource.category === 'transportation' && (
                        <div className="detail-card">
                            <div className="card-header">
                                <h2><i className="fas fa-bus"></i> Transportation Details</h2>
                            </div>
                            <div className="transportation-grid">
                                {renderDetailAlways('fas fa-wheelchair', 'ADA Accessible', resource.ada_accessible)}
                                {renderDetail('fas fa-user-friends', 'Escort Allowed', resource.escort_allowed)}
                                {renderDetail('fas fa-tty', 'TTY', resource.tty)}
                                {renderDetail('fas fa-dollar-sign', 'Cost', resource.cost)}
                            </div>
                </div>
              )}

                    {/* Availability & Capacity Card */}
                    <div className="detail-card">
                         <div className="card-header">
                            <h2><i className="fas fa-bed"></i> Availability & Capacity</h2>
                        </div>
                        <div className="availability-pro-grid">
                           {renderDetail('fas fa-users', 'Capacity', resource.capacity)}
                           {renderDetail('fas fa-door-open', 'Current Availability', resource.current_availability)}
                           {renderDetail('fas fa-chart-pie', 'Typical Occupancy', resource.occupancy)}
                           {renderDetail('fas fa-list-ol', 'Waitlist', resource.waitlist)}
                           {renderDetail('fas fa-hourglass-half', 'Wait Time', resource.wait_time)}
                           {renderDetail('fas fa-calendar-times', 'Length of Stay', resource.length_of_stay)}
                           {renderDetail('fas fa-dollar-sign', 'Cost', resource.cost)}
                </div>
                  </div>

                    {/* Key Features Card */}
                    {resource.key_features && (
                        <div className="detail-card">
                            <div className="card-header">
                                <h2><i className="fas fa-star"></i> Key Features</h2>
                  </div>
                            <p className="key-features-pro">{resource.key_features}</p>
                  </div>
                )}
              </div>

                <aside className="detail-right-column">
                    {/* Contact Card */}
                    <div className="detail-card contact-pro-card">
                        <div className="card-header">
                            <h3><i className="fas fa-phone-alt"></i> Contact Information</h3>
                    </div>
                        {renderDetail('fas fa-phone', 'Primary Contact', resource.contact)}
                        {renderDetail('fas fa-envelope', 'Email', resource.email)}
                        {renderDetail('fas fa-globe', 'Website', resource.website)}
                        {renderDetail('fas fa-tty', 'TTY', resource.tty)}
                        {renderDetail('fas fa-user-circle', 'Official Contact', resource.official_contact)}
                        {renderDetail('fas fa-user-tie', 'CEO Contact', resource.ceo_contact)}
                    </div>

                    {/* Location & Map Card */}
                    <div className="detail-card map-card">
                        <div className="card-header">
                            <h3><i className="fas fa-map-marker-alt"></i> Location</h3>
                </div>
                        {resource.location && 
                         resource.location !== 'Address not specified' && 
                         resource.location !== 'Not specified' && 
                         resource.location !== 'Not listed' && 
                         resource.location !== 'N/A' && (
                            <div className="map-container">
                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(resource.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="250"
                                    loading="lazy"
                                    title={`Map of ${resource.location}`}
                                ></iframe>
              </div>
            )}
                        <div className="location-details">
                            {renderDetail('fas fa-map-marker-alt', 'Location', resource.location)}
                            {renderDetail('fas fa-map', 'Area of Service', resource.area_of_service)}
          </div>
        </div>
                </aside>
            </main>
    </div>
  );
};

export default ResourceDetail; 