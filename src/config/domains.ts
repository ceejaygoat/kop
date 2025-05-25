
// Domain configuration for path-based routing
export const DOMAIN_CONFIG = {
  // Main app subdomain (for the aviator predictor)
  APP_SUBDOMAIN: 'app',
  
  // Licensing system subdomain (for license management)
  LICENSING_SUBDOMAIN: 'licensing',
  
  // Get current subdomain or path-based route
  getCurrentSubdomain: () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    console.log('Current hostname:', hostname);
    console.log('Current path:', path);
    console.log('Current search params:', window.location.search);
    
    // Priority 1: Check for licensing hostname
    if (hostname === 'licensing.ceejaywealthcoding.online') {
      console.log('Detected licensing hostname');
      return 'licensing';
    }
    
    // Priority 2: Check for licensing in path (works everywhere)
    if (path.startsWith('/licensing')) {
      console.log('Detected licensing from path');
      return 'licensing';
    }
    
    // Handle your specific domain - ceejaywealthcoding.online
    if (hostname.includes('ceejaywealthcoding.online')) {
      console.log('Detected ceejaywealthcoding.online domain');
      // For your domain, use path-based routing only
      return 'app'; // Default to app for your domain
    }
    
    // Handle real subdomain detection for other domains
    const parts = hostname.split('.');
    console.log('Hostname parts:', parts);
    
    // If we have a subdomain (more than 2 parts), return the first part
    if (parts.length > 2) {
      const subdomain = parts[0];
      console.log('Detected subdomain:', subdomain);
      if (subdomain === 'licensing') {
        return 'licensing';
      }
    }
    
    // Handle localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check for port-based development setup
      const port = window.location.port;
      if (port === '5174') return 'licensing'; // Licensing dev port
      if (port === '5173') return 'app'; // App dev port
      return 'app'; // Default to app for localhost
    }
    
    // Handle Lovable preview URLs (*.lovable.app)
    if (hostname.includes('lovable.app')) {
      // Priority 2: Check for subdomain in query params (e.g., ?subdomain=licensing)
      const subdomainParam = searchParams.get('subdomain');
      if (subdomainParam) {
        console.log('Detected subdomain from query param:', subdomainParam);
        return subdomainParam;
      }
      
      // Priority 3: Check for licensing keyword in URL
      const fullUrl = window.location.href.toLowerCase();
      if (fullUrl.includes('licensing')) {
        console.log('Detected licensing subdomain from URL');
        return 'licensing';
      }
      
      // Priority 4: Check URL hash for subdomain
      const hash = window.location.hash;
      if (hash.includes('licensing')) {
        console.log('Detected licensing subdomain from hash');
        return 'licensing';
      }
      
      // Default to app for Lovable preview
      console.log('Defaulting to app subdomain for Lovable preview');
      return 'app';
    }
    
    return 'app'; // Default to app instead of empty
  },
  
  // Check if current subdomain matches target
  isSubdomain: (targetSubdomain: string) => {
    const current = DOMAIN_CONFIG.getCurrentSubdomain();
    console.log(`Checking if current subdomain "${current}" matches target "${targetSubdomain}"`);
    return current === targetSubdomain;
  },
  
  // Generate URLs for different subdomains or paths
  getSubdomainUrl: (subdomain: string, path: string = '/') => {
    if (typeof window === 'undefined') return path;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // For licensing, use the specific hostname
    if (subdomain === 'licensing') {
      if (hostname.includes('ceejaywealthcoding.online') || hostname === 'licensing.ceejaywealthcoding.online') {
        return `${protocol}//licensing.ceejaywealthcoding.online${path}`;
      }
    }
    
    // For your real domain, use path-based routing for app
    if (hostname.includes('ceejaywealthcoding.online')) {
      if (subdomain === 'app') {
        return `${protocol}//app.ceejaywealthcoding.online${path}`;
      }
    }
    
    // Handle localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const devPort = subdomain === 'licensing' ? '5174' : '5173';
      return `${protocol}//${hostname}:${devPort}${path}`;
    }
    
    // Handle Lovable preview URLs - use path-based routing
    if (hostname.includes('lovable.app')) {
      if (subdomain === 'licensing') {
        return '/licensing';
      }
      return '/';
    }
    
    const parts = hostname.split('.');
    
    // If we're already on a subdomain, replace it
    if (parts.length > 2) {
      parts[0] = subdomain;
      const newHostname = parts.join('.');
      return `${protocol}//${newHostname}${port ? `:${port}` : ''}${path}`;
    }
    
    // If no subdomain, add it
    const newHostname = `${subdomain}.${hostname}`;
    return `${protocol}//${newHostname}${port ? `:${port}` : ''}${path}`;
  }
};

export type SubdomainType = 'app' | 'licensing' | 'root';

export const getSubdomainType = (): SubdomainType => {
  const current = DOMAIN_CONFIG.getCurrentSubdomain();
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  
  console.log('Getting subdomain type for:', current);
  console.log('Current path for type detection:', path);
  console.log('Current hostname for type detection:', hostname);
  
  // Override: if we're on licensing hostname, always return licensing type
  if (hostname === 'licensing.ceejaywealthcoding.online') {
    console.log('Returning licensing type due to hostname');
    return 'licensing';
  }
  
  // Override: if we're on /licensing path, always return licensing type
  if (path.startsWith('/licensing')) {
    console.log('Returning licensing type due to path');
    return 'licensing';
  }
  
  if (current === DOMAIN_CONFIG.APP_SUBDOMAIN) return 'app';
  if (current === DOMAIN_CONFIG.LICENSING_SUBDOMAIN) return 'licensing';
  return 'app'; // Default to app instead of root
};
