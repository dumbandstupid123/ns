import { useState, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";

const LIVEKIT_URL = "wss://launch-65q9o9la.livekit.cloud";
const API_URL = "http://127.0.0.1:5001"; // Use 127.0.0.1 instead of localhost

const LiveKitModal = ({ setShowSupport }) => {
  const [isSubmittingName, setIsSubmittingName] = useState(true);
  const [name, setName] = useState("");
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const getToken = useCallback(async (userName) => {
    try {
      console.log("Fetching token for user:", userName);
      const response = await fetch(
        `${API_URL}/api/get?name=${encodeURIComponent(userName)}`
      );
      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`);
      }
      const data = await response.json();
      console.log("Token received:", data.token.substring(0, 10) + "...");
      setToken(data.token);
      setIsSubmittingName(false);
      setError(null);
    } catch (error) {
      console.error("Token fetch error:", error);
      setError("Failed to connect to server. Please try again.");
    }
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      getToken(name);
    }
  };

  const handleRoomError = (error) => {
    console.error("LiveKit room error:", error);
    setError("Failed to connect to audio room. Please try again.");
    setIsSubmittingName(true);
  };

  const handleConnected = () => {
    console.log("Connected to LiveKit room successfully");
    setError(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="support-room">
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          {isSubmittingName ? (
            <form onSubmit={handleNameSubmit} className="name-form">
              <h2>Enter your name to connect with support</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              <button type="submit">Connect</button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowSupport(false)}
              >
                Cancel
              </button>
            </form>
          ) : token ? (
            <LiveKitRoom
              serverUrl={LIVEKIT_URL}
              token={token}
              connect={true}
              video={false}
              audio={true}
              onError={handleRoomError}
              onConnected={handleConnected}
              onDisconnected={() => {
                console.log("Disconnected from LiveKit room");
                setShowSupport(false);
                setIsSubmittingName(true);
              }}
            >
              <RoomAudioRenderer />
              <SimpleVoiceAssistant />
            </LiveKitRoom>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LiveKitModal;
