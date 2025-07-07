import React, { useState } from 'react';
import './AddClient.css';

const AddClient = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    primaryLanguage: '',
    interpreterNeeded: false,
    housingStatus: '',
    employmentStatus: ''
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Saving client information...');

    try {
      const response = await fetch('http://localhost:5001/api/add-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('Client added successfully!');
        window.location.href = '/';
      } else {
        throw new Error(data.error || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      setSubmitStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="add-client">
      <h1>New Client Intake Form</h1>
      
      {submitStatus && (
        <div className={`status-message ${submitStatus.includes('Error') ? 'error' : 'success'}`}>
          {submitStatus}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth <span className="required">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Emergency Contact</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                placeholder="Enter relationship"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label>Primary Language</label>
              <input
                type="text"
                name="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={handleChange}
                placeholder="Enter primary language"
              />
            </div>

            <div className="form-group">
              <label>Housing Status</label>
              <select
                name="housingStatus"
                value={formData.housingStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="housed">Housed</option>
                <option value="at-risk">At Risk</option>
                <option value="homeless">Homeless</option>
                <option value="temporary">Temporary Housing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                name="interpreterNeeded"
                checked={formData.interpreterNeeded}
                onChange={handleChange}
              />
              <label>Interpreter Needed</label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Add Client</button>
        </div>
      </form>
    </div>
  );
};

export default AddClient; 