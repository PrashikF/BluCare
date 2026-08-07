import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import { userApi } from '../utils/api';
import { Phone, AlertCircle, CheckCircle2, Edit3, User, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState({
    name: 'Prashik K.',
    email: 'prashik@ragblucare.ai',
    phone: '+91 94038 71129',
    dob: 'October 14, 1998',
    bloodGroup: 'O Positive (O+)',
    allergies: 'Penicillin, Dust Mites',
    emergencyContact: 'Sanket K. (+91 98765 43210)',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userApi.getProfile({ getToken });
        if (data) setProfile((prev) => ({ ...prev, ...data }));
      } catch (err) {
        // Retain fallback
      }
    }
    loadProfile();
  }, [getToken]);

  return (
    <PageContainer>
      <SectionHeader
        title="Patient Identity &"
        highlightTitle="Profile"
        description="Personal medical demographics, emergency contacts, and medical safety flags."
        tag="Account Workspace"
        actions={
          <GlowButton size="md">
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </GlowButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-light">
              <div className="w-20 h-20 rounded-full bg-sage/15 border-2 border-sage/40 text-sage font-semibold text-3xl flex items-center justify-center shadow-[0_0_20px_var(--glow-sage)]">
                P
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary">{profile.name}</h2>
                <p className="text-xs text-subdued font-mono">Patient ID: BLU-2026-8902</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={12} /> HIPAA Verified Profile
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-1">
                <span className="text-subdued uppercase tracking-wider font-semibold font-mono">Email Address</span>
                <p className="text-primary font-medium text-sm">{profile.email}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-1">
                <span className="text-subdued uppercase tracking-wider font-semibold font-mono">Phone Number</span>
                <p className="text-primary font-medium text-sm">{profile.phone}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-1">
                <span className="text-subdued uppercase tracking-wider font-semibold font-mono">Date of Birth</span>
                <p className="text-primary font-medium text-sm">{profile.dob}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-1">
                <span className="text-subdued uppercase tracking-wider font-semibold font-mono">Blood Group</span>
                <p className="text-sage font-medium text-sm">{profile.bloodGroup}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-base font-semibold text-primary flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400" /> Allergies & Medical Safety Alerts
            </h3>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
              <span className="font-semibold text-rose-300">Known Drug Allergies</span>
              <p className="text-secondary">{profile.allergies}</p>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="space-y-4">
            <h3 className="text-base font-semibold text-primary flex items-center gap-2">
              <Phone size={18} className="text-sage" /> Primary Emergency Contact
            </h3>
            <div className="p-4 rounded-2xl bg-bg-surface border border-light space-y-2 text-xs">
              <p className="font-semibold text-primary">{profile.emergencyContact}</p>
              <p className="text-subdued">Designated Next-of-Kin for Emergency SOS Triage</p>
            </div>
            <GlowButton size="sm" variant="secondary" className="w-full">
              Update Contact
            </GlowButton>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
