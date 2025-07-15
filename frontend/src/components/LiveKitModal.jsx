import React from 'react';

const LiveKitModal = ({ setShowSupport }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Voice Assistant</h2>
          <button 
            className="close-button"
            onClick={() => setShowSupport(false)}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="coming-soon">
            <h3>🎤 Voice Assistant Coming Soon!</h3>
            <p>We're working on integrating voice chat functionality.</p>
            <p>For now, please use the text-based Resource Matcher.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSupport(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveKitModal;
