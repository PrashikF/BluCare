// src/pages/AnalyticsPage.jsx
import React from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import MetricCard from '../components/ui/MetricCard';
import Card from '../components/ui/Card';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        title="Health Risk"
        highlightTitle="Analytics"
        description="Predictive trends, symptom frequency analysis, and longitudinal risk modeling."
        tag="Insights Workspace"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          label="Evaluations This Month"
          value="14 Checks"
          subtitle="100% Resolved without acute escalation"
          icon={Activity}
        />

        <MetricCard
          label="Assessment Precision"
          value="94.2%"
          valueColor="text-lavender"
          subtitle="Validated against clinical practice standards"
          icon={ShieldCheck}
        />

        <MetricCard
          label="Overall Risk Index"
          value="Low Risk"
          valueColor="text-emerald-400"
          subtitle="No chronic indicators flagged"
          icon={Heart}
        />
      </div>

      <Card noisy className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-primary">Longitudinal Symptom Severity Curve</h3>
            <p className="text-xs text-subdued">Last 30 days risk index breakdown</p>
          </div>
          <span className="text-xs text-sage bg-sage/10 px-3 py-1 rounded-full border border-sage/20 font-mono">
            30-Day Trend
          </span>
        </div>

        <div className="h-48 flex items-end justify-between gap-4 pt-6 border-b border-light pb-2">
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => {
            const heights = ['h-16', 'h-24', 'h-12', 'h-20'];
            return (
              <div key={week} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-full max-w-[48px] ${heights[idx]} bg-gradient-to-t from-sage/20 to-sage/60 rounded-t-xl border-t border-x border-sage/40 transition-all hover:to-sage`} />
                <span className="text-xs text-subdued font-mono">{week}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
};

export default AnalyticsPage;
