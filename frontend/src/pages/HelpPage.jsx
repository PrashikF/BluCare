// src/pages/HelpPage.jsx
import React, { useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import AlertBanner from '../components/ui/AlertBanner';
import Card from '../components/ui/Card';
import { Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does BluCare+ ensure clinical safety during symptom assessments?',
      a: 'BluCare+ evaluates input against verified clinical practice protocols (WHO & ICD-11 standard guidelines). If high-risk indicators are detected, the system immediately prompts acute emergency care options.',
    },
    {
      q: 'Is my personal health data encrypted and HIPAA compliant?',
      a: 'Yes. All personal demographics, medical journals, and evaluation records are encrypted in transit and at rest using AES-256 GCM encryption following HIPAA standards.',
    },
    {
      q: 'Can I share my evaluation brief with my doctor?',
      a: 'Absolutely. You can visit the Medical Journal section to export a structured PDF clinical brief formatted specifically for physician review.',
    },
    {
      q: 'What should I do if I am experiencing a medical emergency?',
      a: 'Do not rely solely on digital symptom assessments during an acute crisis. Use the Emergency SOS button in the top navigation bar or call local emergency medical services immediately (108 / 911).',
    },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Help &"
        highlightTitle="Safety Center"
        description="Clinical safety disclaimers, FAQs, and support channels."
        tag="Support Workspace"
      />

      <AlertBanner
        type="info"
        title="Important Clinical Disclaimer"
        message="BluCare+ provides clinical guidance and symptom triage support based on medical practice standards. It is designed to assist care decisions and is not a replacement for professional in-person medical diagnosis or emergency hospital treatment."
      />

      <div className="space-y-4">
        <h2 className="text-xl font-light text-primary">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card key={idx} hoverable onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)} className="space-y-2 cursor-pointer">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary">{faq.q}</h3>
                {openFaq === idx ? <ChevronUp size={18} className="text-sage" /> : <ChevronDown size={18} className="text-subdued" />}
              </div>
              {openFaq === idx && (
                <p className="text-xs text-secondary pt-2 border-t border-light leading-relaxed animate-fade-in">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-lavender font-semibold text-sm">
            <Mail size={18} /> Support Email
          </div>
          <p className="text-xs text-subdued">Reach our clinical support team 24/7</p>
          <a href="mailto:support@ragblucare.ai" className="text-sm text-sage font-medium hover:underline block">
            support@ragblucare.ai
          </a>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-sage font-semibold text-sm">
            <Phone size={18} /> Emergency Helpline
          </div>
          <p className="text-xs text-subdued">Direct emergency triage hotline</p>
          <p className="text-sm text-primary font-medium">+91 94038 71129</p>
        </Card>
      </div>
    </PageContainer>
  );
};

export default HelpPage;
