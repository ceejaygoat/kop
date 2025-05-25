
import { Button } from '@/components/ui/button';
import { getSubdomainType } from '@/config/domains';
import { ExternalLink, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubdomainNavigation = () => {
  const subdomainType = getSubdomainType();
  const navigate = useNavigate();

  const handleSubdomainNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex gap-2">
      {subdomainType === 'app' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSubdomainNavigation('/licensing')}
          className="flex items-center gap-2"
        >
          <Settings size={16} />
          License Management
        </Button>
      )}
      
      {subdomainType === 'licensing' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSubdomainNavigation('/licensing')}
          className="flex items-center gap-2"
        >
          <ExternalLink size={16} />
          Go to App
        </Button>
      )}
    </div>
  );
};

export default SubdomainNavigation;
