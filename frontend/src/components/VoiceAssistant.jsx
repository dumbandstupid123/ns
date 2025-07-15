import React, { useState, useRef, useEffect } from 'react';
import './VoiceAssistant.css';

const VoiceAssistant = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: "Hi! I'm your NextStep assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const messagesEndRef = useRef(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
      
      // Load voices - sometimes they need time to load
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('Available voices:', voices.map(v => v.name));
        }
      };
      
      // Load voices immediately and on voiceschanged event
      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      
      // Use OpenAI's TTS API for human-like speech
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert base64 to audio blob
        const audioData = atob(data.audio_data);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        throw new Error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Error with OpenAI TTS:', error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS if OpenAI fails
      if (synthesis) {
        synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 0.9;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    // Stop any currently playing audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Also stop browser synthesis as fallback
    if (synthesis) {
      synthesis.cancel();
    }
    
    setIsSpeaking(false);
  };

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: 'voice_assistant',
          conversation_history: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          text: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Automatically speak the response with OpenAI TTS
        await speakText(data.response);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      icon: 'fa-language',
      label: 'Translation',
      action: () => handleSendMessage('I need help with translation services')
    },
    {
      icon: 'fa-file-alt',
      label: 'Fill Form',
      action: () => handleSendMessage('Help me fill out a form for a client')
    },
    {
      icon: 'fa-home',
      label: 'Housing Resources',
      action: () => handleSendMessage('Show me housing resources')
    },
    {
      icon: 'fa-utensils',
      label: 'Food Resources',
      action: () => handleSendMessage('Show me food assistance programs')
    },
    {
      icon: 'fa-car',
      label: 'Transportation',
      action: () => handleSendMessage('Show me transportation resources')
    },
    {
      icon: 'fa-user-plus',
      label: 'Add Client',
      action: () => handleSendMessage('Help me add a new client')
    },
    {
      icon: 'fa-search',
      label: 'Find Resources',
      action: () => handleSendMessage('Help me find specific resources for a client')
    },
    {
      icon: 'fa-phone',
      label: 'Emergency Help',
      action: () => handleSendMessage('I need emergency resources and contacts')
    }
  ];

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="voice-assistant-minimized">
        <button 
          className="voice-assistant-restore-btn"
          onClick={() => setIsMinimized(false)}
        >
          <i className="fas fa-microphone"></i>
          <span>Sarah</span>
          <i className="fas fa-chevron-up"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="voice-assistant-modal">
      <div className="voice-assistant-container">
        <div className="voice-assistant-header">
          <div className="header-left">
            <i className="fas fa-robot"></i>
            <div>
              <h3>Sarah - AI Assistant</h3>
              <p>Your NextStep voice helper</p>
            </div>
          </div>
          <div className="header-controls">
            <button 
              className="minimize-btn"
              onClick={() => setIsMinimized(true)}
            >
              <i className="fas fa-minus"></i>
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="quick-actions">
          <div className="quick-actions-title">Quick Actions</div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={action.action}
                disabled={isProcessing}
              >
                <i className={`fas ${action.icon}`}></i>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="voice-assistant-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <i className="fas fa-user"></i>
                ) : (
                  <i className="fas fa-robot"></i>
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
              {message.type === 'assistant' && (
                <div className="message-actions">
                  <button 
                    className="speak-btn"
                    onClick={() => speakText(message.text)}
                    disabled={isSpeaking}
                  >
                    <i className="fas fa-volume-up"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="message assistant">
              <div className="message-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                <div className="message-text">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="voice-assistant-input">
          <div className="voice-controls">
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
              {isListening ? 'Stop' : 'Speak'}
            </button>
            
            <select 
              value={selectedVoice} 
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="voice-selector"
              disabled={isProcessing || isSpeaking}
            >
              <option value="nova">Nova (Female)</option>
              <option value="alloy">Alloy (Neutral)</option>
              <option value="echo">Echo (Male)</option>
              <option value="fable">Fable (British)</option>
              <option value="onyx">Onyx (Deep Male)</option>
              <option value="shimmer">Shimmer (Soft Female)</option>
            </select>
            
            {isSpeaking && (
              <button 
                className="stop-speaking-btn"
                onClick={stopSpeaking}
              >
                <i className="fas fa-volume-mute"></i>
                Stop Speaking
              </button>
            )}
          </div>

          <div className="text-input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or click the microphone to speak..."
              className="text-input"
              rows="2"
              disabled={isProcessing}
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isProcessing}
              className="send-btn"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant; 