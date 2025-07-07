import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LiveKitModal from './components/LiveKitModal';
import BrowseResources from './components/BrowseResources';
import AddClient from './components/AddClient';
import RecentClients from './components/RecentClients';
import './App.css';

const Dashboard = () => {
  return (
    <div className="main-content">
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1>Dashboard</h1>
            <p className="welcome-text">Welcome back, Housing Counselor</p>
          </div>
          <div className="dashboard-header-right">
            <Link to="/add-client" className="header-button primary-button">
              <i className="fas fa-plus"></i>
              Add New Client
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Active Cases</div>
              <div className="stat-icon blue">
                <i className="fas fa-users"></i>
              </div>
            </div>
            <div className="stat-value">86</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i>
              8% this month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Urgent Cases</div>
              <div className="stat-icon orange">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div className="stat-value">15</div>
            <div className="stat-change negative">
              <i className="fas fa-arrow-down"></i>
              3% this month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Resources Used</div>
              <div className="stat-icon purple">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
            </div>
            <div className="stat-value">243</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i>
              18% this month
            </div>
          </div>
        </div>

        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/recent-clients" className="header-button outline-button">
            <i className="fas fa-list"></i>
            View All
          </Link>
        </div>

        <div className="client-list">
          <div className="client-item">
            <div className="client-avatar">MU</div>
            <div className="client-info">
              <div className="client-name">Momo Universe</div>
              <div className="client-status">
                <span className="status-indicator"></span>
                Intake Complete
              </div>
            </div>
            <div className="status-tags">
              <span className="status-tag status-housing">
                <i className="fas fa-home"></i>
                Housing
              </span>
              <span className="status-tag status-food">
                <i className="fas fa-utensils"></i>
                Food
              </span>
            </div>
            <div className="last-update">
              <i className="far fa-clock"></i>
              4h ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <div className="logo">
            NextStep
          </div>
          
          <nav>
            <div className="nav-section">
              <div className="nav-section-title">MAIN</div>
              <Link to="/" className="nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
              <Link to="/browse-resources" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Browse Resources</span>
              </Link>
              <Link to="/resource-finder" className="nav-link">
                <i className="fas fa-search"></i>
                <span>Resource Finder</span>
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">TOOLS</div>
              <Link to="/chat" className="nav-link">
                <i className="fas fa-comments"></i>
                <span>AI Assistant</span>
              </Link>
              <Link to="/transcripts" className="nav-link">
                <i className="fas fa-file-alt"></i>
                <span>Voice Transcripts</span>
              </Link>
              <Link to="/add-client" className="nav-link">
                <i className="fas fa-user-plus"></i>
                <span>Add Client</span>
              </Link>
              <Link to="/recent-clients" className="nav-link">
                <i className="fas fa-history"></i>
                <span>Recent Clients</span>
              </Link>
              <Link to="#" className="nav-link">
                <i className="fas fa-bell"></i>
                <span>Notifications</span>
                <span className="badge">3</span>
              </Link>
            </div>
          </nav>

          <div className="sidebar-footer">
            <Link to="/settings" className="nav-link">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
            <Link to="/logout" className="nav-link">
              <i className="fas fa-sign-out-alt"></i>
              <span>Log out</span>
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<LiveKitModal setShowSupport={setShowSupport} />} />
          <Route path="/browse-resources" element={<BrowseResources />} />
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/recent-clients" element={<RecentClients />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
