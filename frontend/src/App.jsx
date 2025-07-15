import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import BrowseResources from './components/BrowseResources';
import AddClient from './components/AddClient';
import RecentClients from './components/RecentClients';
import ResourceDetail from './components/ResourceDetail';
import ResourceSelector from './components/ResourceSelector';
import ResourceMatcher from './components/ResourceMatcher';
import TodoList from './components/TodoList'; // Import new component
import Calendar from './components/Calendar'; // Import new component
import Quote from './components/Quote';     // Import new component
import ResourceStatus from './components/ResourceStatus'; // Import new component
import WaveformBackground from './components/WaveformBackground'; // Import new component
import HelpChatbot from './components/HelpChatbot'; // Import chatbot component
import './App.css';

const Dashboard = ({ showHelpChat, setShowHelpChat }) => {
  return (
    <div className="dashboard-pro">
      {/* Redesigned Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="welcome-text">Welcome back, let's make a difference today.</p>
        </div>
        <div className="dashboard-header-right">
          <Link to="/add-client" className="header-button primary-button">
            <i className="fas fa-plus"></i>
            Add New Client
          </Link>
        </div>
      </div>

      {/* New Dashboard Grid Layout */}
      <div className="dashboard-grid">
        <div className="grid-item-calendar">
          <Calendar />
        </div>
        <div className="grid-item-todo">
          <TodoList />
        </div>
        <div className="grid-item-quote">
           <Quote />
        </div>
        
        {/* Resource Status Widget */}
        <div className="grid-item-resource-status">
          <ResourceStatus />
        </div>
        

      </div>
    </div>
  );
};

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="user-profile">
      <div 
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="avatar-circle">
          {currentUser?.displayName ? 
            currentUser.displayName.charAt(0).toUpperCase() : 
            currentUser?.email?.charAt(0).toUpperCase() || 'U'
          }
        </div>
        <div className="user-info">
          <div className="user-name">
            {currentUser?.displayName || 'User'}
          </div>
          <div className="user-email">
            {currentUser?.email}
          </div>
        </div>
        <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
      </div>
      
      {showDropdown && (
        <div className="user-dropdown">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const [showHelpChat, setShowHelpChat] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="app-container">
                <div className="sidebar">
                  <div className="logo">
                    NextStep
                  </div>
                  
                  <nav>
                    <div className="nav-section">
                      <div className="nav-section-title">MAIN</div>
                      <Link to="/" className="nav-link">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/resource-selector" className="nav-link">
                        <i className="fas fa-warehouse"></i>
                        <span>Resource Center</span>
                      </Link>
                      <Link to="/resource-matcher" className="nav-link">
                        <i className="fas fa-handshake"></i>
                        <span>Resource Matcher</span>
                      </Link>
                    </div>

                    <div className="nav-section">
                      <div className="nav-section-title">TOOLS</div>
                      <button 
                        className="nav-link nav-button"
                        onClick={() => alert('Coming Soon')}
                      >
                        <i className="fas fa-microphone"></i>
                        <span>Assistant</span>
                      </button>
                      <div className="nav-section">
                        <div className="nav-section-title">CLIENTS</div>
                        <Link to="/clients" className="nav-link">
                          <i className="fas fa-users"></i>
                          <span>All Clients</span>
                      </Link>
                      <Link to="/add-client" className="nav-link">
                        <i className="fas fa-user-plus"></i>
                        <span>Add Client</span>
                      </Link>
                      </div>
                    </div>
                  </nav>
                  
                  <UserProfile />
                </div>

                <div className="main-content">
                  <div className="waveform-container">
                    <WaveformBackground />
                  </div>
                  <Routes>
                    <Route path="/" element={<Dashboard showHelpChat={showHelpChat} setShowHelpChat={setShowHelpChat} />} />
                    <Route path="/resource-selector" element={<ResourceSelector />} />
                    <Route path="/browse-resources" element={<BrowseResources />} />
                    <Route path="/resource/:resourceId" element={<ResourceDetail />} />
                    <Route path="/add-client" element={<AddClient />} />
                    <Route path="/clients" element={<RecentClients />} />
                    <Route path="/resource-matcher" element={<ResourceMatcher />} />
                  </Routes>
                </div>
                
                {/* Floating Help Icon */}
                <div className="floating-help-container">
                  <button 
                    className="floating-help-btn"
                    onClick={() => setShowHelpChat(true)}
                    title="Get Help"
                  >
                    <i className="fas fa-question-circle"></i>
                  </button>
                </div>

                {/* Help Chat Popup */}
                {showHelpChat && (
                  <div 
                    className="help-chat-overlay"
                    onClick={(e) => {
                      if (e.target.classList.contains('help-chat-overlay')) {
                        setShowHelpChat(false);
                      }
                    }}
                  >
                    <div className="help-chat-popup">
                      <div className="help-chat-header">
                        <h3>
                          <i className="fas fa-robot"></i>
                          Help Assistant
                        </h3>
                        <button 
                          className="close-help-btn"
                          onClick={() => setShowHelpChat(false)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="help-chat-content">
                        <HelpChatbot />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
