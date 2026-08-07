// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show a glassmorphic loading spinner while Clerk initializes session state
  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-base text-primary p-6">
        <div className="p-8 rounded-3xl bg-bg-surface/80 backdrop-blur-xl border border-light flex flex-col items-center gap-4 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shadow-[0_0_20px_var(--glow-sage)]">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-primary">Verifying Identity...</h3>
            <p className="text-xs text-subdued font-mono">Securing AI Healthcare Workspace</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated access attempt to Sign In page
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Render authenticated child routes
  return <Outlet />;
};

export default ProtectedRoute;
