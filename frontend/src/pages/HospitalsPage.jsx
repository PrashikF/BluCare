// src/pages/HospitalsPage.jsx
import React from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Hospital, PhoneCall, MapPin, Navigation, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const HospitalsPage = () => {
  const hospitals = [
    {
      id: 'hosp-1',
      name: 'City General Emergency Care Hospital',
      distance: '1.8 km away',
      address: '45 Health Care Blvd, Central District',
      phone: '+91 98765 12345',
      type: 'emergency',
      status: 'Open 24/7',
      icuBeds: 12,
      ambulanceTime: '6 mins',
    },
    {
      id: 'hosp-2',
      name: 'Apollo Medical & Cardiac Specialty Center',
      distance: '3.4 km away',
      address: '89 Clinical Avenue, West Wing',
      phone: '+91 98765 67890',
      type: 'specialty',
      status: 'Open 24/7',
      icuBeds: 5,
      ambulanceTime: '10 mins',
    },
    {
      id: 'hosp-3',
      name: 'St. Jude Community Health Clinic',
      distance: '4.1 km away',
      address: '12 Primary Care Way',
      phone: '+91 98765 54321',
      type: 'clinic',
      status: 'Closes at 10 PM',
      icuBeds: 0,
      ambulanceTime: '14 mins',
    },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Emergency Care &"
        highlightTitle="Hospital Finder"
        description="Locate nearby clinics, hospitals, and dispatch ambulances based on risk severity."
        tag="Care Network Workspace"
        actions={
          <Button variant="primary" size="md" className="bg-rose-500/20 border-rose-500/40 text-rose-400">
            <PhoneCall size={16} />
            <span>Dispatch Ambulance (SOS 108)</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Graphic */}
        <div className="lg:col-span-7">
          <Card noisy className="h-[500px] flex flex-col justify-between p-6 relative overflow-hidden border-sage/30">
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-semibold text-sage uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={16} /> Live GPS Triage Location
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                GPS Lock Active
              </span>
            </div>

            <div className="my-auto text-center space-y-4 py-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-sage/10 border border-sage/30 flex items-center justify-center animate-pulse">
                <Navigation size={36} className="text-sage" />
              </div>
              <div>
                <p className="text-lg font-medium text-primary">Central District Triage Zone</p>
                <p className="text-xs text-subdued">3 Facilities within 5 km radius</p>
              </div>
            </div>

            <div className="flex items-center justify-between z-10 pt-4 border-t border-light text-xs text-subdued">
              <span className="flex items-center gap-1.5 text-sage">
                <CheckCircle2 size={14} /> Real-time ICU Bed Monitoring Active
              </span>
              <span className="font-mono">Lat: 18.5204 | Long: 73.8567</span>
            </div>
          </Card>
        </div>

        {/* Hospital List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-medium text-primary">Nearby Medical Facilities</h2>
          <div className="space-y-3">
            {hospitals.map((hosp) => (
              <Card key={hosp.id} hoverable className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-primary">{hosp.name}</h3>
                    <p className="text-xs text-subdued flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {hosp.address}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-sage/10 text-sage border border-sage/20 px-2 py-0.5 rounded">
                    {hosp.distance}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-secondary pt-2 border-t border-light">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock size={12} /> {hosp.status}
                  </span>
                  <span className="text-subdued">•</span>
                  <span className="text-lavender font-mono">
                    {hosp.icuBeds} ICU Beds Free
                  </span>
                  <span className="text-subdued">•</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <ShieldAlert size={12} /> Ambulance: {hosp.ambulanceTime}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={`tel:${hosp.phone}`}
                    className="text-xs text-sage hover:underline flex items-center gap-1 font-medium"
                  >
                    <PhoneCall size={12} /> {hosp.phone}
                  </a>
                  <Button size="sm" variant="secondary">
                    <span>Directions</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HospitalsPage;
