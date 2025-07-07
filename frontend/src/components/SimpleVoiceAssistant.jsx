import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import "./SimpleVoiceAssistant.css";
import ResourcesList from "./ResourcesList";

const Message = ({ type, text }) => {
  return <div className="message">
    <strong className={`message-${type}`}>
      {type === "agent" ? "Agent: " : "You: "}
    </strong>
    <span className="message-text">{text}</span>
  </div>;
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const [audioError, setAudioError] = useState(null);
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        // Request microphone permission explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted:", stream);
        
        // Check if we have a microphone track
        if (!localParticipant?.microphoneTrack) {
          console.warn("No microphone track after permission granted");
          setAudioError("Microphone track not created. Please try reconnecting.");
        } else {
          console.log("Microphone track found:", localParticipant.microphoneTrack);
          setAudioError(null);
        }
      } catch (err) {
        console.error("Microphone access error:", err);
        setAudioError(`Microphone error: ${err.message}`);
      }
    };

    initMicrophone();
  }, [localParticipant]);

  useEffect(() => {
    console.log("Voice Assistant State:", state);
    console.log("Audio Track:", audioTrack);
    console.log("Local Participant:", localParticipant);
    
    if (localParticipant?.microphoneTrack) {
      console.log("Microphone Track State:", {
        enabled: localParticipant.microphoneTrack.isEnabled,
        muted: localParticipant.microphoneTrack.isMuted,
        track: localParticipant.microphoneTrack.track
      });
    }
  }, [state, audioTrack, localParticipant]);

  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant?.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant?.localParticipant,
  });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const allMessages = [
      ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
      ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
    setMessages(allMessages);
    
    // Log transcription updates
    if (agentTranscriptions?.length > 0) {
      console.log("Agent Transcriptions:", agentTranscriptions);
    }
    if (userTranscriptions?.length > 0) {
      console.log("User Transcriptions:", userTranscriptions);
    }
  }, [agentTranscriptions, userTranscriptions]);

  return (
    <div className="voice-assistant-container">
      {audioError && (
        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
          {audioError}
          <button 
            onClick={() => window.location.reload()}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Retry
          </button>
        </div>
      )}
      <div className="visualizer-container">
        <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
      </div>
      <div className="control-section">
        <VoiceAssistantControlBar />
        <button 
          onClick={() => setShowResources(true)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Browse Resources
        </button>
        <div className="conversation">
          {messages.map((msg, index) => (
            <Message key={msg.id || index} type={msg.type} text={msg.text} />
          ))}
        </div>
      </div>
      {showResources && <ResourcesList onClose={() => setShowResources(false)} />}
    </div>
  );
};

export default SimpleVoiceAssistant;
