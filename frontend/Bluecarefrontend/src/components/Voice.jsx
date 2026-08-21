import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic } from 'lucide-react';

const STORAGE_KEY = 'blucare_chat_history';

export default function Voice({ user, onClose }) {
  const navigate = useNavigate();

  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'speaking'
  const [speakerName, setSpeakerName] = useState('Yukti');
  const [mainText, setMainText] = useState('Initializing...');
  const [statusText, setStatusText] = useState('Tap to interact');
  const [textVisible, setTextVisible] = useState(false);

  const synthRef = useRef(window.speechSynthesis || null);
  const recognitionRef = useRef(null);
  const isVoiceActiveRef = useRef(true);
  const mockTimeoutRef = useRef(null);

  const updateVoiceText = (speaker, text) => {
    setTextVisible(false);
    setTimeout(() => {
      setSpeakerName(speaker);
      setMainText(text);
      setTextVisible(true);
    }, 300);
  };

  const logMessageToChatHistory = (role, content) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let appState = { sessions: [] };
    if (saved) {
      try { appState = JSON.parse(saved); } catch (e) {}
    }
    if (!appState.sessions || appState.sessions.length === 0) {
      const newSess = {
        id: 'sess_' + Date.now(),
        timestamp: Date.now(),
        isTemporary: false,
        messages: [{ role: 'ai', content: "Hello, I'm Yukti." }]
      };
      appState.sessions = [newSess];
      appState.currentSessionId = newSess.id;
    }
    const currentId = appState.currentSessionId || appState.sessions[appState.sessions.length - 1].id;
    appState.sessions = appState.sessions.map(s => {
      if (s.id === currentId) {
        return {
          ...s,
          messages: [...s.messages, { role, content, expanded: false }]
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  };

  const speakYukti = (text) => {
    setVoiceState('speaking');
    setStatusText('Yukti is speaking...');
    updateVoiceText('Yukti', text);
    logMessageToChatHistory('ai', text);

    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      utterance.onend = () => {
        if (isVoiceActiveRef.current) {
          startListening();
        }
      };
      synthRef.current.speak(utterance);
    } else {
      setTimeout(() => {
        if (isVoiceActiveRef.current) startListening();
      }, 3000);
    }
  };

  const handleVoiceUserInput = (text) => {
    clearTimeout(mockTimeoutRef.current);
    setVoiceState('idle');
    setStatusText('Processing...');
    updateVoiceText(user?.name || 'Prashik', text);
    logMessageToChatHistory('user', text);

    setTimeout(() => {
      speakYukti("I hear you. It's completely normal to feel that way. I'm right here with you.");
    }, 1500);
  };

  const simulateUserVoice = () => {
    handleVoiceUserInput("I've just been feeling a little overwhelmed lately.");
  };

  const startListening = () => {
    setVoiceState('listening');
    setStatusText('Listening...');
    updateVoiceText(user?.name || 'Prashik', '...');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        simulateUserVoice();
      }
    } else {
      mockTimeoutRef.current = setTimeout(simulateUserVoice, 4000);
    }

    mockTimeoutRef.current = setTimeout(() => {
      if (isVoiceActiveRef.current && mainText === '...') {
        if (recognitionRef.current) recognitionRef.current.stop();
        simulateUserVoice();
      }
    }, 6000);
  };

  useEffect(() => {
    isVoiceActiveRef.current = true;

    // Speech Recognition setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            handleVoiceUserInput(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            updateVoiceText(user?.name || 'Prashik', interimTranscript + '...');
          }
        }
      };

      rec.onerror = () => {
        simulateUserVoice();
      };

      recognitionRef.current = rec;
    }

    const timer = setTimeout(() => {
      speakYukti(`Hello ${user?.name || 'Prashik'}. I'm here. How are you feeling right now?`);
    }, 500);

    return () => {
      isVoiceActiveRef.current = false;
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      clearTimeout(mockTimeoutRef.current);
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    isVoiceActiveRef.current = false;
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    clearTimeout(mockTimeoutRef.current);

    if (onClose) {
      onClose();
    } else {
      navigate('/chat');
    }
  };

  const toggleVoiceState = () => {
    if (voiceState === 'listening') {
      if (recognitionRef.current) recognitionRef.current.stop();
      setVoiceState('idle');
      setStatusText('Paused');
    } else if (voiceState === 'speaking') {
      if (synthRef.current) synthRef.current.cancel();
      startListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="voice-overlay active" data-state={voiceState}>
      <div className="voice-bg-glow" />

      {/* Header */}
      <div className="voice-header">
        <div className="brand">
          <div className="brand-dot" style={{ boxShadow: 'none' }} />
          <span>BluCare+ Voice</span>
        </div>
        <button
          className="close-voice-btn"
          onClick={handleClose}
          title="Return to text chat"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="voice-content">
        <div className={`voice-speaker-name ${textVisible ? 'visible' : ''}`}>
          {speakerName}
        </div>
        <div className={`voice-main-text ${textVisible ? 'visible' : ''}`}>
          {mainText}
        </div>
      </div>

      {/* Controls */}
      <div className="voice-controls">
        <button
          className="big-mic-btn"
          id="bigMicBtn"
          onClick={toggleVoiceState}
          title="Tap to speak or pause"
        >
          <Mic size={32} />
        </button>
        <div className="voice-status-text" id="voiceStatusText">
          {statusText}
        </div>
      </div>
    </div>
  );
}
