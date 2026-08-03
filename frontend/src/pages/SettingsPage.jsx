// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { Cpu, Database, Sliders } from 'lucide-react';

const SettingsPage = () => {
  const { addToast } = useToast();
  const [selectedProtocol, setSelectedProtocol] = useState('standard-care');
  const [sensitivity, setSensitivity] = useState('85');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Care protocol & sensitivity preferences saved successfully!', 'success');
    }, 600);
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Platform & Care"
        highlightTitle="Settings"
        description="Configure clinical care protocols, assessment sensitivity thresholds, and display preferences."
        tag="System Workspace"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-light pb-3">
              <Cpu size={18} className="text-sage" /> Clinical Care Protocol Standard
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'standard-care',
                  name: 'Standard Clinical Guidelines 2026 (Recommended)',
                  desc: 'Comprehensive symptom evaluation based on WHO primary care protocols.',
                },
                {
                  id: 'rapid-triage',
                  name: 'Urgent Triage & Emergency Protocol',
                  desc: 'Optimized for high-speed acute risk detection and immediate referral.',
                },
                {
                  id: 'research-guidelines',
                  name: 'Evidence-Based Research Standard',
                  desc: 'Provides extended clinical documentation and trial references.',
                },
              ].map((proto) => (
                <label
                  key={proto.id}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedProtocol === proto.id
                      ? 'bg-sage/10 border-sage text-primary'
                      : 'bg-bg-surface border-light text-secondary hover:border-secondary'
                    }`}
                >
                  <input
                    type="radio"
                    name="protocol"
                    checked={selectedProtocol === proto.id}
                    onChange={() => setSelectedProtocol(proto.id)}
                    className="mt-1 accent-sage"
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">{proto.name}</p>
                    <p className="text-xs text-subdued mt-0.5">{proto.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-light pb-3">
              <Sliders size={18} className="text-lavender" /> Assessment Sensitivity & Precision
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-secondary font-medium">Symptom Match Sensitivity</span>
                  <span className="text-sage font-mono font-semibold">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full accent-sage cursor-pointer"
                />
                <p className="text-[11px] text-subdued mt-1">
                  Assessments requiring greater than {sensitivity}% specificity will suggest targeted follow-up questions.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Database size={16} className="text-sage" /> System Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-light">
                <span className="text-subdued">Clinical Database</span>
                <span className="text-primary font-mono">Verified Standard</span>
              </div>
              <div className="flex justify-between py-1 border-b border-light">
                <span className="text-subdued">Encryption</span>
                <span className="text-primary font-mono">AES-256 GCM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-subdued">HIPAA Compliance</span>
                <span className="text-emerald-400 font-semibold">Certified</span>
              </div>
            </div>
            <Button onClick={handleSave} loading={isSaving} size="sm" className="w-full">
              Save Preferences
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
