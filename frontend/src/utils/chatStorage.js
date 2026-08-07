// src/utils/chatStorage.js
import { logger } from './logger';

const STORAGE_KEY = 'blucare_chat_sessions';
const ACTIVE_SESSION_KEY = 'blucare_active_session_id';

// Initial demo sessions if user has no saved history
const INITIAL_DEMO_SESSIONS = [
  {
    id: 'demo-sess-1',
    title: 'Persistent mild fever & cough analysis',
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago (Today)
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        text: 'I have had a persistent mild fever and dry cough for 2 days.',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-2',
        role: 'bot',
        text: `### Symptom Assessment & Clinical Evaluation\n\nBased on your reported symptoms of **mild fever** and **dry cough** lasting 2 days:\n\n#### 1. Clinical Risk Classification\n- **Risk Index**: Low Risk (No acute respiratory distress reported)\n- **Primary Recommendation**: Oral hydration & temperature monitoring\n\n#### 2. Care Protocol\n- Maintain fluid intake (2.5L daily water/electrolytes)\n- Monitor body temperature every 6 hours\n- Avoid heavy physical exertion\n\n*If fever exceeds 102°F (38.9°C) or shortness of breath develops, seek immediate clinical evaluation.*`,
        risk_level: 'low',
        confidence: 0.95,
        timestamp: '10:16 AM',
        sources: [
          { title: 'WHO Primary Care Guidelines 2026', id: 'WHO-2026-04', tag: 'WHO' },
        ],
      },
    ],
  },
  {
    id: 'demo-sess-2',
    title: 'Migraine dosage & medication guide',
    createdAt: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        text: 'What medicine is commonly prescribed for migraine relief?',
        timestamp: 'Yesterday 09:30 AM',
      },
      {
        id: 'msg-4',
        role: 'bot',
        text: `### Pharmacy & Clinical Dosage Guidance\n\nFor acute migraine management, clinical guidelines recommend standard first-line therapies:\n\n1. **Over-The-Counter (OTC)**: NSAIDs such as Ibuprofen (400mg) or Acetaminophen.\n2. **Prescription Triptans**: Sumatriptan for moderate-to-severe attacks under physician supervision.\n\n*Always consult a licensed physician or pharmacist before starting new medication.*`,
        risk_level: 'low',
        confidence: 0.92,
        timestamp: 'Yesterday 09:31 AM',
      },
    ],
  },
  {
    id: 'demo-sess-3',
    title: 'Blood panel & lipid report check',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago (Previous 7 days)
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        text: 'Can you help me understand lipid profile results?',
        timestamp: 'Jul 28, 2:40 PM',
      },
      {
        id: 'msg-6',
        role: 'bot',
        text: `### Health Record Analysis — Lipid Panel\n\nA standard lipid panel measures:\n- **LDL (Low-Density Lipoprotein)**: "Optimal" level is generally under 100 mg/dL.\n- **HDL (High-Density Lipoprotein)**: Higher numbers (>50 mg/dL) are protective for cardiac health.\n- **Triglycerides**: Target level is below 150 mg/dL.`,
        risk_level: 'low',
        confidence: 0.96,
        timestamp: 'Jul 28, 2:41 PM',
      },
    ],
  },
];

export const getSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SESSIONS));
      return INITIAL_DEMO_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Failed to read sessions from localStorage:', err);
    return INITIAL_DEMO_SESSIONS;
  }
};

export const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    logger.error('Failed to save sessions to localStorage:', err);
  }
};

export const getActiveSessionId = () => {
  try {
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    const sessions = getSessions();
    if (activeId && sessions.some((s) => s.id === activeId)) {
      return activeId;
    }
    if (sessions.length > 0) {
      return sessions[0].id;
    }
    const newSess = createSession('New Health Consultation');
    return newSess.id;
  } catch (err) {
    logger.error('Failed to get active session ID:', err);
    return 'demo-sess-1';
  }
};

export const setActiveSessionId = (id) => {
  try {
    if (id) localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch (err) {
    logger.error('Failed to set active session ID:', err);
  }
};

export const getSessionById = (id) => {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
};

export const createSession = (initialTitle = 'New Health Consultation', threadId = null) => {
  const sessions = getSessions();
  const newSession = {
    id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    threadId: threadId,
    title: initialTitle,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  const updated = [newSession, ...sessions];
  saveSessions(updated);
  setActiveSessionId(newSession.id);
  return newSession;
};

export const updateSession = (id, updates) => {
  const sessions = getSessions();
  const updated = sessions.map((s) => {
    if (s.id === id) {
      return {
        ...s,
        ...updates,
        updatedAt: Date.now(),
      };
    }
    return s;
  });
  saveSessions(updated);
  return updated.find((s) => s.id === id) || null;
};

export const renameSession = (id, newTitle) => {
  return updateSession(id, { title: newTitle });
};

export const deleteSession = (id) => {
  const sessions = getSessions();
  const updated = sessions.filter((s) => s.id !== id);
  saveSessions(updated);
  if (getActiveSessionId() === id) {
    const nextActive = updated.length > 0 ? updated[0].id : '';
    setActiveSessionId(nextActive);
  }
  return updated;
};

export const groupSessionsByDate = (sessions) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const groups = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  };

  sessions.forEach((sess) => {
    const time = sess.updatedAt || sess.createdAt;
    if (time >= startOfToday) {
      groups.today.push(sess);
    } else if (time >= startOfYesterday) {
      groups.yesterday.push(sess);
    } else if (time >= startOf7Days) {
      groups.last7Days.push(sess);
    } else {
      groups.older.push(sess);
    }
  });

  return groups;
};
