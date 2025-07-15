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

const Message = ({ type, text, messageId, onTranslate, translatedText, selectedLanguage }) => {
  const [showTranslated, setShowTranslated] = useState(false);
  
  return <div className="message">
    <strong className={`message-${type}`}>
      {type === "agent" ? "Sarah: " : "You: "}
    </strong>
    <span className="message-text">
      {showTranslated && translatedText ? translatedText : text}
    </span>
    {selectedLanguage !== 'English' && (
      <button 
        onClick={() => {
          if (!translatedText) {
            onTranslate(text, messageId);
          }
          setShowTranslated(!showTranslated);
        }}
        style={{
          marginLeft: '0.5rem',
          padding: '0.2rem 0.5rem',
          fontSize: '12px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        {showTranslated ? 'Original' : 'Translate'}
      </button>
    )}
  </div>;
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const [audioError, setAudioError] = useState(null);
  const [showResources, setShowResources] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [translatedMessages, setTranslatedMessages] = useState({});

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

  const translateMessage = async (text, messageId) => {
    if (selectedLanguage === 'English') return text;
    
    try {
      const response = await fetch('http://localhost:5001/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          target_language: selectedLanguage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTranslatedMessages(prev => ({
          ...prev,
          [messageId]: data.translated
        }));
        return data.translated;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    return text;
  };

  const languages = [
    'English', 'Spanish', 'French', 'Vietnamese', 'Arabic', 
    'Chinese', 'Korean', 'Russian', 'Portuguese', 'German'
  ];

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
        
        <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: 'white', fontSize: '14px' }}>Language:</label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white'
            }}
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setShowResources(true)}
            style={{
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
        </div>
        <div className="conversation">
          {messages.map((msg, index) => (
            <Message 
              key={msg.id || index} 
              type={msg.type} 
              text={msg.text}
              messageId={msg.id || index}
              onTranslate={translateMessage}
              translatedText={translatedMessages[msg.id || index]}
              selectedLanguage={selectedLanguage}
            />
          ))}
        </div>
      </div>
      {showResources && <ResourcesList onClose={() => setShowResources(false)} />}
    </div>
  );
};

export default SimpleVoiceAssistant;
