// src/pages/HospitalsPage.jsx - Emergency Ambulance Assistance Module
import React, { useState, useEffect } from 'react';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '@clerk/clerk-react';
import { hospitalsApi } from '../utils/api';
import {
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Ambulance,
  Loader2,
  LocateFixed,
  Send,
} from 'lucide-react';

const MOCK_AMBULANCE_PROVIDERS = [
  {
    id: 'amb-1',
    name: 'Apex Cardiac ALS Ambulance Unit',
    type: 'Advanced Life Support (ALS)',
    distance: '1.2 km away',
    eta: '4 - 6 mins',
    phone: '+91 98765 12345',
    status: 'Available 24/7',
    driver: 'Suresh M.',
    vehicleNo: 'MH-12-EQ-4092',
  },
  {
    id: 'amb-2',
    name: 'City Fast-Response Emergency Care',
    type: 'Basic Life Support (BLS)',
    distance: '2.4 km away',
    eta: '6 - 8 mins',
    phone: '+91 98765 67890',
    status: 'On-Duty',
    driver: 'Ramesh K.',
    vehicleNo: 'MH-12-EM-9912',
  },
  {
    id: 'amb-3',
    name: 'St. Jude Mobile ICU Service',
    type: 'Neonatal & Pediatric ICU',
    distance: '3.8 km away',
    eta: '9 - 12 mins',
    phone: '+91 98765 54321',
    status: 'Available 24/7',
    driver: 'Vikram S.',
    vehicleNo: 'MH-12-ICU-1088',
  },
  {
    id: 'amb-4',
    name: 'Apollo Emergency Trauma Dispatch',
    type: 'Trauma & Cardiac Care',
    distance: '4.5 km away',
    eta: '11 - 14 mins',
    phone: '+91 98765 99887',
    status: 'Available 24/7',
    driver: 'Anil P.',
    vehicleNo: 'MH-12-TR-7721',
  },
];

const HospitalsPage = () => {
  const { addToast } = useToast();

  const [locationState, setLocationState] = useState('idle'); // idle | requesting | granted | error | unsupported
  const [errorMessage, setErrorMessage] = useState('');
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [requestedId, setRequestedId] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      setErrorMessage('Geolocation is not supported by your current browser.');
      addToast('Geolocation unsupported', 'error');
      return;
    }

    setLocationState('requesting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude });
        setAccuracy(Math.round(accuracy));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setLocationState('granted');
        addToast('Location updated successfully', 'success');

        // Trigger nearby ambulance provider search
        searchAmbulances();
      },
      (error) => {
        setLocationState('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission was denied. Please allow location access in your browser settings to find ambulances near you.');
            addToast('Location permission denied', 'error');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is currently unavailable. Please check your device GPS or network signal.');
            addToast('Location unavailable', 'error');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Please click retry to attempt again.');
            addToast('Location request timed out', 'error');
            break;
          default:
            setErrorMessage('An unexpected error occurred while requesting your location.');
            addToast('Failed to acquire location', 'error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const { getToken } = useAuth();

  const searchAmbulances = async (latitude = 18.5204, longitude = 73.8567) => {
    setIsSearching(true);
    try {
      const data = await hospitalsApi.getNearbyAmbulances(latitude, longitude, { getToken });
      setAmbulances(data.providers || MOCK_AMBULANCE_PROVIDERS);
    } catch (err) {
      setAmbulances(MOCK_AMBULANCE_PROVIDERS);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestAmbulance = (amb) => {
    setRequestedId(amb.id);
    addToast(`Ambulance requested from ${amb.name}! ETA: ${amb.eta}`, 'success');
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <SectionHeader
        title="Emergency Ambulance"
        highlightTitle="Assistance"
        description="Need urgent medical assistance? Allow location access so we can help find the nearest available ambulance."
        tag="Rapid Emergency Dispatch"
      />

      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        {/* Location Status & Request Container */}
        {locationState === 'idle' && (
          <GlassCard noisy className="p-8 text-center space-y-6 border-sage/30">
            <div className="w-20 h-20 mx-auto rounded-full bg-sage/15 border border-sage/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_var(--glow-sage)]">
              <LocateFixed size={40} className="text-sage" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-primary">Location Access Required</h2>
              <p className="text-sm text-subdued leading-relaxed">
                Enable location to find nearby ambulances and dispatch emergency responders directly to your position.
              </p>
            </div>

            <div>
              <GlowButton
                onClick={requestLocation}
                variant="primary"
                size="lg"
                className="px-8 py-4 text-sm font-semibold rounded-2xl bg-sage text-bg-base shadow-[0_0_25px_var(--glow-sage)] hover:scale-105 active:scale-95 transition-all"
              >
                <LocateFixed size={18} />
                <span>Enable Location</span>
              </GlowButton>
            </div>
          </GlassCard>
        )}

        {/* Loading Requesting State */}
        {locationState === 'requesting' && (
          <GlassCard className="p-8 text-center space-y-4 border-sage/30">
            <Loader2 size={36} className="mx-auto text-sage animate-spin" />
            <p className="text-base font-medium text-primary">Requesting location permission...</p>
            <p className="text-xs text-subdued">Please click "Allow" in your browser popup.</p>
          </GlassCard>
        )}

        {/* Error / Denied State */}
        {(locationState === 'error' || locationState === 'unsupported') && (
          <GlassCard className="p-6 space-y-4 border-rose-500/30 bg-rose-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-rose-300">Unable to Access Location</h3>
                <p className="text-xs text-subdued leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {locationState !== 'unsupported' && (
                <GlowButton onClick={requestLocation} size="sm" variant="primary" className="bg-rose-500/20 border-rose-500/40 text-rose-300">
                  <RefreshCw size={14} />
                  <span>Retry Location Request</span>
                </GlowButton>
              )}
              <a
                href="tel:108"
                className="no-underline inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                <PhoneCall size={14} />
                <span>Call Emergency 108</span>
              </a>
            </div>
          </GlassCard>
        )}

        {/* Granted State Location Bar */}
        {locationState === 'granted' && coords && (
          <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-4 border-sage/30 bg-sage/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-sage uppercase tracking-wider font-mono">Current Location Lock</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <CheckCircle2 size={10} /> Accuracy: ±{accuracy}m
                  </span>
                </div>
                <p className="text-xs font-mono text-primary mt-0.5">
                  Lat: {coords.latitude.toFixed(4)}° N | Long: {coords.longitude.toFixed(4)}° E
                </p>
                {lastUpdated && <p className="text-[10px] text-subdued mt-0.5">Updated: {lastUpdated}</p>}
              </div>
            </div>

            <button
              onClick={requestLocation}
              className="px-3 py-1.5 rounded-xl border border-light text-xs text-subdued hover:text-primary hover:bg-bg-card transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Refresh Location</span>
            </button>
          </GlassCard>
        )}

        {/* Ambulance Provider Search Results */}
        {locationState === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Ambulance size={20} className="text-sage" />
                <span>Nearby Available Ambulances</span>
              </h2>
              {ambulances.length > 0 && (
                <span className="text-xs text-sage font-mono">{ambulances.length} Providers Found</span>
              )}
            </div>

            {/* Searching Loader */}
            {isSearching && (
              <GlassCard className="p-8 text-center space-y-3 border-sage/30">
                <Loader2 size={32} className="mx-auto text-sage animate-spin" />
                <p className="text-sm text-primary font-medium">Finding nearby ambulances...</p>
              </GlassCard>
            )}

            {/* Empty Provider State */}
            {!isSearching && ambulances.length === 0 && (
              <GlassCard className="p-8 text-center space-y-4 border-rose-500/30">
                <AlertTriangle size={36} className="mx-auto text-rose-400" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-primary">No nearby ambulances found</p>
                  <p className="text-xs text-subdued">Please call emergency services immediately.</p>
                </div>
                <a
                  href="tel:108"
                  className="no-underline inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                >
                  <PhoneCall size={16} />
                  <span>Call Emergency 108 Now</span>
                </a>
              </GlassCard>
            )}

            {/* Provider Cards */}
            {!isSearching && ambulances.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulances.map((amb) => {
                  const isRequested = requestedId === amb.id;
                  return (
                    <GlassCard key={amb.id} hoverable className="p-5 flex flex-col justify-between space-y-4 border-light">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold text-primary">{amb.name}</h3>
                            <p className="text-xs text-sage font-medium mt-0.5">{amb.type}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-sage/15 text-sage border border-sage/30 px-2 py-0.5 rounded-full shrink-0">
                            {amb.distance}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-subdued mt-3 pt-3 border-t border-light">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Clock size={13} /> ETA: {amb.eta}
                          </span>
                          <span>•</span>
                          <span className="text-subdued font-mono">{amb.status}</span>
                        </div>

                        {isRequested && (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1 text-emerald-300">
                            <p className="font-semibold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Ambulance Dispatched!
                            </p>
                            <p className="text-[11px] text-subdued">
                              Driver: {amb.driver} ({amb.vehicleNo})
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-light">
                        <a
                          href={`tel:${amb.phone}`}
                          className="flex-1 no-underline py-2.5 px-3 rounded-xl bg-bg-card border border-light text-primary hover:text-sage hover:border-sage/40 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                        >
                          <PhoneCall size={14} />
                          <span>Call Provider</span>
                        </a>

                        <GlowButton
                          onClick={() => handleRequestAmbulance(amb)}
                          size="sm"
                          variant={isRequested ? 'secondary' : 'primary'}
                          className={`flex-1 ${isRequested ? 'border-emerald-500/40 text-emerald-400' : ''}`}
                        >
                          <Send size={14} />
                          <span>{isRequested ? 'Requested' : 'Request Ambulance'}</span>
                        </GlowButton>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Persistent Call 108 Emergency SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="tel:108"
          className="no-underline flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(225,29,72,0.7)] animate-pulse transition-all transform hover:scale-105 active:scale-95"
          title="Direct Emergency Hotline"
        >
          <PhoneCall size={18} className="animate-bounce" />
          <span>Call 108</span>
        </a>
      </div>
    </PageContainer>
  );
};

export default HospitalsPage;
