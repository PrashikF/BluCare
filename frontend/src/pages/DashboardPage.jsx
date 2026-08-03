// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import MetricCard from '../components/ui/MetricCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RiskBadge from '../components/ui/RiskBadge';
import { RAG_MODULES } from '../config/ragModules';
import {
  Stethoscope,
  ArrowRight,
  Activity,
  Hospital,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [symptomInput, setSymptomInput] = useState('');

  const handleQuickLaunch = (e) => {
    e.preventDefault();
    if (symptomInput.trim()) {
      navigate(`/app/chat/diagnostic?prompt=${encodeURIComponent(symptomInput)}`);
    } else {
      navigate('/app/chat/diagnostic');
    }
  };

  const recentSessions = [
    {
      id: 'sess-1',
      date: 'Today, 2:15 PM',
      symptoms: 'Mild Fever & Persistent Dry Cough',
      risk: 'low',
      confidence: 0.94,
      engine: 'Symptom Assessment',
    },
    {
      id: 'sess-2',
      date: 'Yesterday, 10:30 AM',
      symptoms: 'Lower Back Muscle Strain',
      risk: 'low',
      confidence: 0.91,
      engine: 'Symptom Assessment',
    },
    {
      id: 'sess-3',
      date: 'Jul 24, 2026',
      symptoms: 'Transient Dizziness & Migraine',
      risk: 'medium',
      confidence: 0.88,
      engine: 'Symptom Assessment',
    },
  ];

  return (
    <PageContainer>
      {/* Header Banner */}
      <SectionHeader
        title="Clinical Care"
        highlightTitle="Dashboard"
        description="Real-time health status, symptom assessment launcher, and care management hub."
        tag="Overview Workspace"
        actions={
          <Button onClick={() => navigate('/app/chat/diagnostic')} size="md">
            <Stethoscope size={18} />
            <span>Start Symptom Assessment</span>
          </Button>
        }
      />

      {/* Widget Grid Row 1: Quick Launch Banner */}
      <Card noisy className="border-sage/30 bg-sage/5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 border border-sage/20 text-xs font-semibold text-sage">
              <Zap size={14} /> Clinical Symptom Check
            </div>
            <h2 className="text-2xl font-light text-primary">
              How are you feeling right now?
            </h2>
            <p className="text-secondary text-sm">
              Describe your symptoms to receive instant evidence-based guidance and personalized care protocols.
            </p>
          </div>

          <form onSubmit={handleQuickLaunch} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g., 'Sharp pain in right knee after running'..."
              className="w-full sm:w-80 md:w-96 bg-input-bg border border-light focus:border-sage rounded-2xl px-4 py-3 text-sm text-primary placeholder:text-subdued outline-none transition-colors"
            />
            <Button type="submit" size="md" className="shrink-0">
              <span>Begin Assessment</span>
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </Card>

      {/* Widget Grid Row 2: Status & SOS & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Active Health Status"
          value="Baseline Normal"
          valueColor="text-emerald-400"
          subtitle="Based on 3 recent evaluations. No acute warnings detected."
          icon={Activity}
          onClick={() => navigate('/app/analytics')}
        />

        <MetricCard
          label="Emergency Care SOS"
          value="3 Facilities Nearby"
          valueColor="text-rose-400"
          subtitle="Nearest triage facility is 1.8 km away (Arrival: 6 mins)."
          icon={Hospital}
          onClick={() => navigate('/app/hospitals')}
        />

        <MetricCard
          label="Clinical Services Status"
          value="4 Services Active"
          valueColor="text-lavender"
          subtitle="HIPAA certified clinical protocols online."
          icon={ShieldCheck}
          onClick={() => navigate('/app/settings')}
        />
      </div>

      {/* Widget Grid Row 3: Services Showcase & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clinical Services */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-light text-primary">Available Care Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RAG_MODULES.map((module) => (
              <Card
                key={module.id}
                hoverable
                onClick={() => navigate(`/app/chat/${module.id}`)}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 text-sage flex items-center justify-center">
                    <Stethoscope size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-lavender bg-lavender/10 px-2 py-0.5 rounded border border-lavender/20">
                    {module.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-medium text-primary">{module.name}</h3>
                  <p className="text-xs text-subdued mt-1 line-clamp-2">{module.description}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-sage font-medium">
                  <span>Open Service</span>
                  <ArrowRight size={14} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-primary">Recent Evaluations</h2>
            <button
              onClick={() => navigate('/app/journal')}
              className="text-xs text-lavender hover:underline cursor-pointer"
            >
              View Full History
            </button>
          </div>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Card key={session.id} hoverable onClick={() => navigate('/app/chat/diagnostic')} className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-subdued flex items-center gap-1">
                    <Clock size={12} /> {session.date}
                  </span>
                  <RiskBadge level={session.risk} confidence={session.confidence} />
                </div>
                <p className="text-sm text-primary font-medium">{session.symptoms}</p>
                <p className="text-[11px] text-subdued mt-1">{session.engine}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
