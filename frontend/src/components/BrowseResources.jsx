import React, { useState } from 'react';
import './BrowseResources.css';

const BrowseResources = () => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [referralStatus, setReferralStatus] = useState('');

  const resources = [
    {
      name: "Open Door Mission - RRCC",
      type: "Medical",
      shortDescription: "Respite and Recuperative Care Center for adults with acute medical needs",
      details: {
        organization: "Open Door Mission",
        programType: "Respite and Recuperative Care Center",
        contact: "713-921-7520 (call at 8:30-9 AM, ask for Phillip Von)",
        targetPopulation: "Adults 17+, currently established with Harris Health System",
        eligibility: "Must have acute medical need and be established with Harris Health System",
        services: "Medical respite care for individuals recovering from illness or injury",
        keyFeatures: ["Specialized medical respite care", "Harris Health System integration"]
      }
    },
    {
      name: "Txbunkhouse Men's Shelter",
      type: "Emergency",
      shortDescription: "Emergency shelter for men with self-pay model",
      details: {
        organization: "Txbunkhouse",
        programType: "Men's Emergency Shelter",
        contact: "713-237-9988",
        targetPopulation: "Men 18+",
        eligibility: "Males only, must have valid state ID, cannot be sex offender, must be self-sufficient",
        documentation: "Valid state-issued photo ID required",
        services: ["Dormitory-style housing", "Bed and locker assignment", "On-site laundry", "TV room", "Full service kitchen"],
        cost: "$18 first day, $16 per day thereafter (payment due before 8 PM daily)",
        availability: "First come, first serve basis",
        process: "Walk-ins only, no referrals accepted"
      }
    },
    {
      name: "Magnificat Houses Inc - Emergency Shelter",
      type: "Emergency",
      shortDescription: "Comprehensive emergency shelter with support services",
      details: {
        organization: "Magnificat Houses Inc",
        programType: "Emergency Shelter",
        contact: "713-529-4231",
        hours: "Monday-Friday 8:30 AM - 3:30 PM (waiting list sign-up)",
        targetPopulation: "Single females, single males, homeless population 18+",
        eligibility: "Homeless or at risk of losing housing, photo ID required",
        documentation: ["Photo ID required", "TB test", "May accept birth certificate with photo for undocumented"],
        criminalHistory: "Case-by-case basis, no violent crimes or registered sex offenders",
        disability: "Must be able to accommodate themselves, climb stairs, be medically stable",
        substanceUse: "Must have sponsor and be active in treatment",
        mentalHealth: "Accepted unless in crisis (manic episodes excluded)",
        services: ["Emergency shelter", "Customized support during intake", "ID assistance", "Housing assessments"],
        amenities: ["Wi-Fi", "Washer and dryer"],
        languages: ["English", "Spanish"],
        lengthOfStay: "90 days maximum",
        cost: "First 15 days free (if rules followed), then $125 bi-weekly"
      }
    },
    {
      name: "RoseMary's Place",
      type: "Housing",
      shortDescription: "Permanent supportive housing for homeless individuals",
      details: {
        organization: "Magnificat Houses Inc",
        programType: "Permanent Supportive Housing",
        contact: "713-529-4231",
        targetPopulation: "Homeless individuals 17+, both male and female",
        keyFeatures: ["Permanent supportive housing option", "Same organization as emergency shelter"]
      }
    },
    {
      name: "Veterans Village - Transitional Housing",
      type: "Veterans",
      shortDescription: "Comprehensive transitional housing program for veterans",
      details: {
        organization: "United States Veterans Initiative",
        programType: "Transitional Housing for Veterans",
        contact: "Latricia 832-226-4798",
        eligibility: "Must be enrolled in VA, referral required from CRRC (1700 Webster Street)",
        documentation: ["DD214", "Driver's license", "VA enrollment", "TB test within 7 days"],
        services: [
          "Case management",
          "Mental health support",
          "Substance abuse support",
          "Employment services",
          "Vocational training",
          "Life skills",
          "Permanent housing assistance"
        ],
        housingTypes: [
          "Bridge housing",
          "Low demand",
          "Service-intensive",
          "Clinical treatment",
          "Special needs",
          "Transitional apartments"
        ],
        futureDevelopment: "Tiny homes construction by end of August",
        lengthOfStay: "Bridge housing up to 90 days, service-intensive 6 months to 1 year",
        cost: "Bridge housing/clinical treatment $232/month maximum, other programs free"
      }
    },
    {
      name: "Veterans Village - Permanent Housing",
      type: "Veterans",
      shortDescription: "Permanent housing solution for veterans",
      details: {
        organization: "United States Veterans Initiative",
        contact: "Dustin 346-262-3755, dgressett@usvets.org",
        officialContact: "832-203-1926",
        eligibility: "Must pass background check for Tunnels to Towers and U.S. Vets programs",
        housingType: "Permanent apartment housing",
        services: "Optional supportive services available",
        requirements: ["Must provide own meals and furniture", "Background check required"],
        cost: "$832/month, all bills included"
      }
    },
    {
      name: "Lord of the Streets",
      type: "Day Services",
      shortDescription: "Day center providing direct assistance services",
      details: {
        organization: "Lord of the Streets",
        programType: "Day Center",
        contact: "713-526-0311 (ask for Katie)",
        services: ["Direct assistance program", "Day services only"],
        note: "Not a temporary shelter"
      }
    },
    {
      name: "Star of Hope - Men's Development Center",
      type: "Development",
      shortDescription: "Development center focused on men's services",
      details: {
        organization: "Star of Hope",
        programType: "Men's Development Center",
        contact: "713-748-0700 (Press 1, then 1)",
        hours: "Monday-Friday 8 AM-4 PM",
        targetPopulation: "Men"
      }
    },
    {
      name: "Star of Hope - Women & Family Center",
      type: "Family Services",
      shortDescription: "Development center for women and families",
      details: {
        organization: "Star of Hope",
        programType: "Women & Family Development Center",
        contact: "713-748-0700 (Press 1, then 2)",
        hours: "Monday, Tuesday, Wednesday, Friday 8 AM-2 PM",
        targetPopulation: "Women and families"
      }
    },
    {
      name: "God's Lovely Butterflies Maternal Home",
      type: "Family Services",
      shortDescription: "Comprehensive support for pregnant and single mothers",
      details: {
        organization: "God's Lovely Butterflies",
        programType: "Maternal/Family Housing",
        contact: "832-264-7491, godslovelybutterflies@gmail.com",
        hours: "24/7 intakes available",
        targetPopulation: "Pregnant mothers and single mothers, ages 16+",
        eligibility: "Homeless population, no discrimination, very inclusive admission policy",
        documentation: ["Basic ID and Social Security Card", "Flexible documentation requirements"],
        services: [
          "Temporary housing",
          "Case management",
          "Government assistance (TANF, SNAP)",
          "Diapers",
          "Wipes",
          "Baby items",
          "Classes"
        ],
        requirements: "Residents responsible for own food and hygiene (unless teenager)",
        languages: "All languages supported with translators",
        lengthOfStay: "30-60-90 days up to 1 year (some stayed 3 years recently)",
        participation: "Required to participate in classes and groups with vendors",
        capacity: "4 beds total",
        cost: "Free for some, $550/month for others based on sliding scale assessment",
        process: "In-person intake (even if online form completed), within 24 hours response",
        followUp: "Phone, text, email every 6 months"
      }
    },
    {
      name: "Friday's Harbor",
      type: "Emergency",
      shortDescription: "Temporary lodging services",
      details: {
        organization: "Friday's Harbor",
        programType: "Temporary Lodging",
        contact: "713-504-9557",
        ceoContact: "brian.hall@fridayharbour.org"
      }
    },
    {
      name: "Covenant House Texas",
      type: "Youth Services",
      shortDescription: "Youth services and crisis care",
      details: {
        organization: "Covenant House Texas",
        contact: "713-523-2231",
        programType: "Youth Services",
        keyFeatures: ["Youth-focused programs", "Crisis intervention services"]
      }
    },
    {
      name: "Harmony House - Women & Family Center",
      type: "Family Services",
      shortDescription: "Development center for women and families",
      details: {
        organization: "Harmony House Inc",
        programType: "Women & Family Development Center",
        contact: "713-221-6216",
        targetPopulation: "Women and families"
      }
    },
    {
      name: "Wellsprings Village",
      type: "Emergency",
      shortDescription: "Emergency and transitional housing for women",
      details: {
        organization: "Wellsprings Inc",
        programType: "Emergency Shelter and Transitional Housing",
        contact: "713-529-6559",
        hours: "Currently 8-5 (changing soon)",
        targetPopulation: "Women only, ages 25-45, past substance abuse or mental health problems",
        eligibility: "Homeless, should have job or willing to find one, must be able to work",
        immigration: "Haven't accepted undocumented individuals",
        disability: "Must be able to walk",
        substanceUse: "Must pass drug test",
        documentation: ["Life story", "Mental health assessment", "Homeless letter", "TB test"],
        services: [
          "Emergency shelter",
          "Transitional housing",
          "Bus passes",
          "Limited clothing/food",
          "Job readiness support"
        ],
        amenities: ["Supplies", "Towels", "Sheets", "Beds", "Washing machines", "Computer access"],
        languages: ["English", "Limited Spanish"],
        lengthOfStay: "90 days emergency shelter (30-day increments), up to 2 years transitional housing",
        rules: [
          "Must buy own items",
          "No sharing",
          "Insured car if owned",
          "6 PM curfew",
          "6 hours training requirement"
        ],
        capacity: "32 beds total",
        cost: "Free emergency shelter, small percentage of paycheck for transitional housing (~20%)",
        contact: "Ms. Valerie Beckham (director)"
      }
    },
    {
      name: "Salvation Army - Family Residence Jones",
      type: "Family Services",
      shortDescription: "Comprehensive family emergency shelter services",
      details: {
        organization: "Salvation Army",
        programType: "Family Emergency Shelter",
        contact: "713-650-6530",
        hours: "Monday-Friday 8 AM-10 PM",
        targetPopulation: "Single women (any age), families including infants, transgender women, single fathers with children",
        eligibility: "Typically homeless, any age accepted",
        immigration: "Accept undocumented with some form of identification",
        criminalHistory: "Accepted except sex offenders",
        disability: "ADA rooms available",
        workRequirement: "Should be willing to work or open to getting assistance",
        documentation: [
          "Birth certificate for all children (or food stamps if no birth certificate)",
          "Some type of ID for adults",
          "Accept old ID or copies",
          "Will work with outside country ID"
        ],
        services: [
          "Emergency shelter",
          "Housing assessment",
          "Deposit/first month rent assistance",
          "Career help",
          "Case management",
          "Veteran services referrals"
        ],
        amenities: [
          "Kitchen serving all meals",
          "Activity room for kids with TV",
          "Playground",
          "Small basketball court"
        ],
        languages: ["English", "Spanish"],
        lengthOfStay: "30 days with possible extension",
        rules: [
          "7 PM curfew",
          "Follow meal times",
          "Weekly case manager meetings",
          "Job search requirement"
        ],
        capacity: "142 beds total",
        cost: "Free for emergency shelter",
        process: "Phone call intake, prefer self-referral, phone interview then next-day admission",
        waitTime: "About 1-2 weeks",
        intakeDuration: "1-2 hours",
        contact: "Sabrina Valentin sabrina.valentin@ss.salvationarmy.org"
      }
    },
    {
      name: "Salvation Army - Young Adult Center",
      type: "Youth Services",
      shortDescription: "Resource center for young adults",
      details: {
        organization: "Salvation Army",
        programType: "Young Adult Resource Center",
        contact: "713-658-9205",
        targetPopulation: "Young adults"
      }
    },
    {
      name: "Houston Area Women's Center",
      type: "Crisis Services",
      shortDescription: "Crisis services and support for women",
      details: {
        organization: "Houston Area Women's Center",
        contact: "713-528-2121 (hotline)",
        programType: "Women's services",
        services: ["Crisis hotline", "Women-focused support services"]
      }
    },
    {
      name: "The Bridge Over Troubled Waters",
      type: "Crisis Services",
      shortDescription: "Crisis intervention and support services",
      details: {
        organization: "The Bridge Over Troubled Waters",
        programType: "Crisis Services",
        services: ["Crisis intervention", "Support services"]
      }
    }
  ];

  const resourceTypes = [...new Set(resources.map(r => r.type))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedType === 'All' || resource.type === selectedType;
    return matchesSearch && matchesFilter;
  });

  const handleReferral = async (resource) => {
    try {
      setReferralStatus('Sending referral...');
      
      const response = await fetch('http://localhost:8000/api/send-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceName: resource.name,
          resourceType: resource.type,
          resourceDetails: resource.description || resource.shortDescription,
          senderEmail: 'sr185@rice.edu'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReferralStatus(`Referral sent successfully for ${resource.name}`);
      } else {
        throw new Error(data.error || 'Failed to send referral');
      }
    } catch (error) {
      console.error('Error sending referral:', error);
      setReferralStatus(`Error: ${error.message}`);
    }

    // Clear status after 5 seconds
    setTimeout(() => setReferralStatus(''), 5000);
  };

  return (
    <div className="browse-resources">
      <div className="resources-header">
        <h1>Browse Resources</h1>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Medical">Medical</option>
            <option value="Emergency">Emergency</option>
            <option value="Veterans">Veterans</option>
            <option value="Housing">Housing</option>
            <option value="Family">Family</option>
            <option value="Crisis">Crisis</option>
            <option value="Youth">Youth</option>
            <option value="Day">Day Services</option>
          </select>
        </div>
      </div>

      {referralStatus && (
        <div className={`referral-status ${referralStatus.includes('Error') ? 'error' : 'success'}`}>
          {referralStatus}
        </div>
      )}

      <div className="resources-grid">
        {filteredResources.map((resource, index) => (
          <div key={index} className="resource-card">
            <h3>{resource.name}</h3>
            <span className={`resource-type ${resource.type}`}>{resource.type}</span>
            <p>{resource.shortDescription}</p>
            <div className="card-buttons">
              <button onClick={() => setSelectedResource(resource)}>Learn More</button>
              <button 
                className="referral-button"
                onClick={() => handleReferral(resource)}
              >
                Log a Referral
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedResource && (
        <div className="resource-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedResource(null)}>×</button>
            <h2>{selectedResource.name}</h2>
            <div className="details-grid">
              {Object.entries(selectedResource.details).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <h4>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseResources; 