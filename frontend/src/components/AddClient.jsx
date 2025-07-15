import React, { useState } from 'react';
import './AddClient.css';
import { API_ENDPOINTS } from '../config';

const AddClient = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Section 1: Client Information
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
    preferredLanguage: '',
    interpreterNeeded: false,
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    
    // Section 2: Referral Source
    referralSource: {
      type: '',
      agencyName: '',
      otherDetails: ''
    },
    
    // Section 3: Presenting Concerns
    presentingConcerns: {
      housingInstability: false,
      foodInsecurity: false,
      unemployment: false,
      domesticViolence: false,
      mentalHealth: false,
      substanceUse: false,
      childWelfare: false,
      legalIssues: false,
      immigrationSupport: false,
      medicalNeeds: false,
      transportationNeeds: false,
      other: false,
      otherDescription: ''
    },
    
    // Section 4: Social History
    socialHistory: {
      householdMembers: '',
      employmentStatus: '',
      incomeSources: {
        employment: false,
        ssiSsdi: false,
        tanf: false,
        none: false
      },
      housingStatus: '',
      educationLevel: '',
      healthInsurance: {
        medicaid: false,
        medicare: false,
        private: false,
        none: false
      }
    },
    
    // Section 5: Risk & Safety Screening
    riskAndSafety: {
      safeInCurrentEnvironment: null,
      experiencingViolence: null,
      accessToFood: null,
      hasPrimaryCareProvider: null,
      childrenInHome: null,
      cpsConcerns: null
    },
    
    // Section 6: Consent & Confidentiality
    consent: {
      understoodConfidentiality: false,
      consentToServices: false,
      clientSignature: '',
      clientSignatureDate: '',
      staffName: '',
      staffSignature: '',
      staffSignatureDate: ''
    }
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, subParent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [subParent]: {
              ...prev[parent][subParent],
              [child]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitStatus('Saving client information...');

    try {
      const response = await fetch(API_ENDPOINTS.ADD_CLIENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('Client added successfully!');
        // Wait a moment to show the success message
        setTimeout(() => {
          window.location.href = '/recent-clients';
        }, 1500);
      } else {
        throw new Error(data.detail || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      setSubmitStatus(`Error: ${error.message}`);
    }
  };

  const renderProgressBar = () => (
    <div className="progress-bar" style={{'--progress': (currentStep / totalSteps) * 100}}>
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`progress-step ${index + 1 <= currentStep ? 'active' : ''}`}
          onClick={() => setCurrentStep(index + 1)}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-label">
            {index === 0 && "Personal Info"}
            {index === 1 && "Referral"}
            {index === 2 && "Concerns"}
            {index === 3 && "Social History"}
            {index === 4 && "Risk Assessment"}
            {index === 5 && "Consent"}
          </div>
        </div>
      ))}
    </div>
  );

  const renderClientInfo = () => (
    <div className="form-section slide-in">
            <h2>Personal Information</h2>
      <p className="section-description">
        Let's start by collecting some basic information about the client. This helps us understand their needs and provide the best possible assistance.
      </p>
            <div className="form-group">
        <label>Full Name *</label>
        <div className="name-inputs">
          <div className="input-container">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              placeholder="First Name"
                required
              />
            </div>
          <div className="input-container">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              placeholder="Last Name"
                required
              />
          </div>
        </div>
            </div>

            <div className="form-group">
        <label>Date of Birth *</label>
        <div className="input-container">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
        </div>
            </div>

            <div className="form-group">
              <label>Gender</label>
        <div className="input-container">
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

            <div className="form-group">
        <label>Contact Information *</label>
        <div className="input-container">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
            placeholder="Phone Number"
                required
              />
            </div>
        <div className="input-container" style={{marginTop: '1rem'}}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
            placeholder="Email Address (Optional)"
              />
        </div>
            </div>

            <div className="form-group">
              <label>Address</label>
        <div className="input-container">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
            placeholder="Street Address"
              />
            </div>
        <div className="address-details">
          <div className="input-container">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              placeholder="City"
              />
            </div>
          <div className="input-container">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              placeholder="State"
              />
            </div>
          <div className="input-container">
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              placeholder="ZIP Code"
              />
            </div>
          </div>
      </div>
    </div>
  );

  const renderReferralSource = () => (
    <div className="form-section slide-in">
      <h2>Referral Information</h2>
            <div className="form-group">
        <label>Referral Source</label>
        <select
          name="referralSource.type"
          value={formData.referralSource.type}
                onChange={handleChange}
        >
          <option value="">Select Referral Source</option>
          <option value="self">Self-Referral</option>
          <option value="hospital">Hospital</option>
          <option value="school">School</option>
          <option value="agency">Agency</option>
          <option value="other">Other</option>
        </select>
            </div>

      {formData.referralSource.type && formData.referralSource.type !== 'self' && (
            <div className="form-group">
          <label>Agency/Organization Name</label>
              <input
                type="text"
            name="referralSource.agencyName"
            value={formData.referralSource.agencyName}
                onChange={handleChange}
            placeholder="Enter agency or organization name"
              />
            </div>
      )}

            <div className="form-group">
        <label>Additional Details</label>
        <textarea
          name="referralSource.otherDetails"
          value={formData.referralSource.otherDetails}
                onChange={handleChange}
          placeholder="Any additional details about the referral"
        />
      </div>
    </div>
  );

  const renderPresentingConcerns = () => (
    <div className="form-section slide-in">
      <h2>Presenting Concerns</h2>
      <p className="section-description">
        Please select all areas where the client is experiencing challenges or needs support. This helps us understand their primary concerns and prioritize services.
      </p>
      <div className="concerns-grid">
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.housingInstability"
            checked={formData.presentingConcerns.housingInstability}
            onChange={handleChange}
            id="housing"
          />
          <label htmlFor="housing">Housing Instability</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.foodInsecurity"
            checked={formData.presentingConcerns.foodInsecurity}
            onChange={handleChange}
            id="food"
              />
          <label htmlFor="food">Food Insecurity</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.unemployment"
            checked={formData.presentingConcerns.unemployment}
            onChange={handleChange}
            id="unemployment"
          />
          <label htmlFor="unemployment">Unemployment</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.domesticViolence"
            checked={formData.presentingConcerns.domesticViolence}
            onChange={handleChange}
            id="domestic-violence"
          />
          <label htmlFor="domestic-violence">Domestic Violence</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.mentalHealth"
            checked={formData.presentingConcerns.mentalHealth}
            onChange={handleChange}
            id="mental-health"
          />
          <label htmlFor="mental-health">Mental Health</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.substanceUse"
            checked={formData.presentingConcerns.substanceUse}
            onChange={handleChange}
            id="substance-use"
          />
          <label htmlFor="substance-use">Substance Use</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.childWelfare"
            checked={formData.presentingConcerns.childWelfare}
            onChange={handleChange}
            id="child-welfare"
          />
          <label htmlFor="child-welfare">Child Welfare</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.legalIssues"
            checked={formData.presentingConcerns.legalIssues}
            onChange={handleChange}
            id="legal-issues"
          />
          <label htmlFor="legal-issues">Legal Issues</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.immigrationSupport"
            checked={formData.presentingConcerns.immigrationSupport}
            onChange={handleChange}
            id="immigration"
          />
          <label htmlFor="immigration">Immigration Support</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.medicalNeeds"
            checked={formData.presentingConcerns.medicalNeeds}
            onChange={handleChange}
            id="medical-needs"
          />
          <label htmlFor="medical-needs">Medical Needs</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.transportationNeeds"
            checked={formData.presentingConcerns.transportationNeeds}
            onChange={handleChange}
            id="transportation"
          />
          <label htmlFor="transportation">Transportation Needs</label>
        </div>
        <div className="concern-item">
          <input
            type="checkbox"
            name="presentingConcerns.other"
            checked={formData.presentingConcerns.other}
            onChange={handleChange}
            id="other-concerns"
          />
          <label htmlFor="other-concerns">Other Concerns</label>
            </div>
          </div>

      {formData.presentingConcerns.other && (
            <div className="form-group">
          <label>Please describe other concerns:</label>
          <div className="input-container">
            <textarea
              name="presentingConcerns.otherDescription"
              value={formData.presentingConcerns.otherDescription}
                onChange={handleChange}
              placeholder="Please provide details about other concerns..."
              rows="3"
              />
            </div>
        </div>
      )}
    </div>
  );

  const renderSocialHistory = () => (
    <div className="form-section slide-in">
      <h2>Social History</h2>

            <div className="form-group">
        <label>Household Members</label>
        <textarea
          name="socialHistory.householdMembers"
          value={formData.socialHistory.householdMembers}
                onChange={handleChange}
          placeholder="Please describe who lives in your household"
        />
            </div>

            <div className="form-group">
              <label>Employment Status</label>
              <select
          name="socialHistory.employmentStatus"
          value={formData.socialHistory.employmentStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
          <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
          <option value="disability">On Disability</option>
                <option value="retired">Retired</option>
              </select>
            </div>

      <div className="form-group">
        <label>Income Sources</label>
            <div className="checkbox-group">
          {Object.entries(formData.socialHistory.incomeSources).map(([key, value]) => (
            <div key={key} className="checkbox-item">
              <input
                type="checkbox"
                id={`income-${key}`}
                name={`socialHistory.incomeSources.${key}`}
                checked={value}
                onChange={handleChange}
              />
              <label htmlFor={`income-${key}`}>
                {key === 'ssiSsdi' ? 'SSI/SSDI' : key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Housing Status</label>
        <select
          name="socialHistory.housingStatus"
          value={formData.socialHistory.housingStatus}
          onChange={handleChange}
        >
          <option value="">Select Status</option>
          <option value="stable">Stable Housing</option>
          <option value="transitional">Transitional Housing</option>
          <option value="shelter">Shelter</option>
          <option value="unsheltered">Unsheltered</option>
        </select>
      </div>
    </div>
  );

  const renderRiskAssessment = () => (
    <div className="form-section slide-in">
      <h2>Safety Assessment</h2>
      <p className="section-description">Please answer the following questions about your current situation:</p>

      <div className="assessment-grid">
        {Object.entries(formData.riskAndSafety).map(([key, value]) => {
          const question = {
            safeInCurrentEnvironment: "Do you feel safe in your current environment?",
            experiencingViolence: "Are you currently experiencing any form of violence or abuse?",
            accessToFood: "Do you have reliable access to food?",
            hasPrimaryCareProvider: "Do you have a primary care provider?",
            childrenInHome: "Are there children in the home?",
            cpsConcerns: "Are there any child protection concerns?"
          }[key];

          return (
            <div key={key} className="assessment-item">
              <label>{question}</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`riskAndSafety.${key}`}
                    value="yes"
                    checked={value === true}
                    onChange={() => handleNestedChange('riskAndSafety', key, true)}
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`riskAndSafety.${key}`}
                    value="no"
                    checked={value === false}
                    onChange={() => handleNestedChange('riskAndSafety', key, false)}
                  />
                  No
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderConsent = () => (
    <div className="form-section slide-in">
      <h2>Consent & Confidentiality</h2>
      
      <div className="consent-section">
        <h3>Confidentiality Agreement</h3>
        <p className="consent-text">
          We are committed to protecting your privacy and maintaining the confidentiality of your personal information.
          The information you provide will be used only for the purpose of providing you with appropriate services
          and support. Your information will not be shared with third parties without your explicit consent,
          except where required by law.
        </p>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consent.understoodConfidentiality"
              checked={formData.consent.understoodConfidentiality}
              onChange={handleChange}
            />
            I have read and understood the confidentiality agreement
          </label>
        </div>

        <h3>Consent to Services</h3>
        <p className="consent-text">
          By agreeing below, you consent to receive services from our organization. This includes assessment,
          referral to appropriate resources, and follow-up support as needed. You may withdraw your consent
          at any time by notifying us in writing.
        </p>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consent.consentToServices"
              checked={formData.consent.consentToServices}
              onChange={handleChange}
            />
            I consent to receive services
          </label>
        </div>

        <div className="signature-section">
          <div className="form-group">
            <label>Client Signature</label>
            <input
              type="text"
              name="consent.clientSignature"
              value={formData.consent.clientSignature}
              onChange={handleChange}
              placeholder="Type your full name"
            />
            <input
              type="date"
              name="consent.clientSignatureDate"
              value={formData.consent.clientSignatureDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderClientInfo();
      case 2:
        return renderReferralSource();
      case 3:
        return renderPresentingConcerns();
      case 4:
        return renderSocialHistory();
      case 5:
        return renderRiskAssessment();
      case 6:
        return renderConsent();
      default:
        return null;
    }
  };

  return (
    <div className="add-client">
      <h1>Client Intake Assessment</h1>
      
      {renderProgressBar()}

      <div className="form-container">
        {submitStatus && (
          <div className={`status-message ${submitStatus.includes('Error') ? 'error' : 'success'}`}>
            {submitStatus}
          </div>
        )}

                <div>
          {renderStepContent()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="prev-button">
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="next-btn"
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="submit-btn"
                disabled={!formData.consent.understoodConfidentiality || !formData.consent.consentToServices}
              >
                <i className="fas fa-check"></i> Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClient; 