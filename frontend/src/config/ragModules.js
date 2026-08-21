// src/config/ragModules.js - Clinical Care Modules Registry

export const RAG_MODULES = [
  {
    id: "diagnostic",
    name: "Symptom Assessment",
    category: "Clinical Care",
    description: "Interactive symptom evaluation, risk classification & follow-up care",
    icon: "Stethoscope",
    badge: "Primary Care",
    endpoint: "/chat",
    defaultPrompt: "Describe how you are feeling (e.g., 'Persistent mild fever and dry cough')...",
  },
  {
    id: "literature",
    name: "Medical Research Portal",
    category: "Knowledge Base",
    description: "Evidence-based medical guidelines, clinical trials & reference library",
    icon: "BookOpen",
    badge: "Research",
    endpoint: "/chat",
    defaultPrompt: "Search medical guidelines (e.g., 'Management of hypertension in adults')...",
  },
  {
    id: "records",
    name: "Personal Health Records",
    category: "Patient Data",
    description: "Medical history, lab report summaries, and immunization logs",
    icon: "FileText",
    badge: "Protected",
    endpoint: "/chat",
    defaultPrompt: "Search health records (e.g., 'View blood panel results from June 2026')...",
  },
  {
    id: "pharmacy",
    name: "Medication & Dosage Guide",
    category: "Pharmacy",
    description: "Pharmaceutical interaction checking, dosage guides & safety warnings",
    icon: "Pill",
    badge: "Pharmacy",
    endpoint: "/chat",
    defaultPrompt: "Check drug interactions (e.g., 'Amoxicillin and daily multivitamins')...",
  },
];

export const GET_MODULE_BY_ID = (id) => {
  return RAG_MODULES.find((m) => m.id === id) || RAG_MODULES[0];
};
