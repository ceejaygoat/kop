
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { getSubdomainType, DOMAIN_CONFIG } from '@/config/domains';

// App routes (for app.yourdomain.com)
import Welcome from '@/pages/Welcome';
import LicenseKey from '@/pages/LicenseKey';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

// Licensing routes (for licensing.yourdomain.com)
import LicensingSystemWithAuth from '@/pages/LicensingSystemWithAuth';

const SubdomainRouter = () => {
  const [subdomainType, setSubdomainType] = useState<'app' | 'licensing' | 'root'>('root');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const detectSubdomain = () => {
      const type = getSubdomainType();
      console.log('SubdomainRouter detected type:', type);
      console.log('Current path:', location.pathname);
      console.log('Full URL:', window.location.href);
      setSubdomainType(type);
      setIsLoading(false);
    };

    // Initial detection
    detectSubdomain();

    // Listen for URL changes (including query params)
    const handleLocationChange = () => {
      detectSubdomain();
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Also listen for URL changes that might not trigger popstate
    const handleHashChange = () => {
      detectSubdomain();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [location.pathname]);

  // Show loading state while detecting subdomain
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Detecting subdomain...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering SubdomainRouter with type:', subdomainType);
  console.log('Current location pathname:', location.pathname);

  // Always render all routes - React Router will handle the matching
  return (
    <Routes>
      <Route path="/licensing" element={<LicensingSystemWithAuth />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/license" element={<LicenseKey />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default SubdomainRouter;
