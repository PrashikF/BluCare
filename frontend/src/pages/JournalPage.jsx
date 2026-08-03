// src/pages/JournalPage.jsx
import React, { useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../contexts/ToastContext';
import { Download, Calendar, FileText, Share2, Search } from 'lucide-react';

const JournalPage = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const journals = [
    {
      id: 'j-1',
      date: 'July 29, 2026',
      symptoms: 'Mild Fever & Persistent Dry Cough',
      risk: 'low',
      confidence: 0.94,
      notes: 'Initial check recommended hydration and rest. No acute chest pain.',
    },
    {
      id: 'j-2',
      date: 'July 28, 2026',
      symptoms: 'Lower Back Muscle Strain',
      risk: 'low',
      confidence: 0.91,
      notes: 'Postural fatigue after long sitting. Warm compress recommended.',
    },
    {
      id: 'j-3',
      date: 'July 24, 2026',
      symptoms: 'Transient Dizziness & Migraine',
      risk: 'medium',
      confidence: 0.88,
      notes: 'Followed up with hydration intake. Advised monitoring blood pressure.',
    },
  ];

  const handleExportPDF = () => {
    addToast('Generating Clinical PDF Brief for Physician Review...', 'success');
  };

  const handleShareRecord = (symptoms) => {
    addToast(`Clinical summary link copied for "${symptoms}"`, 'info');
  };

  const filteredJournals = journals.filter((j) =>
    j.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <SectionHeader
        title="Patient Medical"
        highlightTitle="Journal"
        description="Longitudinal history of symptom evaluations, clinical transcripts, and exportable physician summaries."
        tag="Health Records Workspace"
        actions={
          <Button onClick={handleExportPDF} variant="secondary" size="md">
            <Download size={16} />
            <span>Export Clinical PDF Brief</span>
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subdued" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past diagnosis logs..."
            className="w-full bg-input-bg border border-light focus:border-sage rounded-xl pl-9 pr-4 py-2 text-sm text-primary placeholder:text-subdued outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredJournals.length > 0 ? (
          filteredJournals.map((log) => (
            <Card key={log.id} hoverable className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-subdued">
                  <Calendar size={14} className="text-sage" />
                  <span className="font-mono">{log.date}</span>
                </div>
                <RiskBadge level={log.risk} confidence={log.confidence} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-primary">{log.symptoms}</h3>
                <p className="text-xs text-secondary mt-1">{log.notes}</p>
              </div>

              <div className="pt-3 border-t border-light flex items-center justify-between text-xs">
                <span className="text-subdued flex items-center gap-1">
                  <FileText size={14} /> Full Transcript Available
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShareRecord(log.symptoms)}
                    className="text-subdued hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 size={12} /> Share Record
                  </button>
                  <button
                    onClick={() => addToast(`Opening session analysis for ${log.date}`, 'info')}
                    className="text-sage hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    View Analysis →
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center text-subdued space-y-2">
            <p className="text-sm font-medium text-primary">No medical journal entries match "{searchQuery}"</p>
            <p className="text-xs">Try searching for a different symptom or date.</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default JournalPage;
