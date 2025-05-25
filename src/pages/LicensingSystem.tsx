import { useState, useEffect } from "react";
import { Key, Calendar, Users, Shield, Copy, Check, AlertCircle, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { licenseApi, type License } from "@/services/licenseApi";
import { aviatorBotApi, type AviatorBot } from "@/services/aviatorBotApi";
import { supabase } from '@/integrations/supabase/client';
import SubdomainNavigation from "@/components/SubdomainNavigation";

const LicensingSystem = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [aviatorBots, setAviatorBots] = useState<AviatorBot[]>([]);
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState("30");
  const [selectedBotId, setSelectedBotId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [licenseCount, setLicenseCount] = useState(0);
  
  // New bot creation states
  const [showNewBotForm, setShowNewBotForm] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    loadLicenses();
    loadAviatorBots();
  }, []);

  const loadLicenses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await licenseApi.getAllLicenses();
      if (response.success) {
        setLicenses(response.licenses);
        setLicenseCount(response.licenses.length);
      } else {
        setError(response.message || 'Failed to load licenses');
      }
    } catch (error) {
      console.error('Error loading licenses:', error);
      setError('Unable to connect to license server');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAviatorBots = async () => {
    try {
      const response = await aviatorBotApi.getAllBots();
      if (response.success) {
        setAviatorBots(response.bots);
        if (response.bots.length > 0 && !selectedBotId) {
          setSelectedBotId(response.bots[0].id);
        }
      } else {
        setError(response.message || 'Failed to load aviator bots');
      }
    } catch (error) {
      console.error('Error loading aviator bots:', error);
    }
  };

  const handleCreateBot = async () => {
    if (!newBotName.trim()) return;

    setIsCreatingBot(true);
    setError("");
    
    try {
      const response = await aviatorBotApi.createBot({
        name: newBotName.trim(),
        description: newBotDescription.trim() || undefined,
      });

      if (response.success) {
        await loadAviatorBots();
        setNewBotName("");
        setNewBotDescription("");
        setShowNewBotForm(false);
        if (response.bot) {
          setSelectedBotId(response.bot.id);
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      setError('Unable to create aviator bot. Please try again.');
    } finally {
      setIsCreatingBot(false);
    }
  };

  const handleGenerateLicense = async () => {
    if (!email.trim() || !selectedBotId || !ownerName.trim()) return;

    if (licenseCount >= 1000) {
      setError("Maximum license limit of 1000 reached!");
      return;
    }

    setIsCreating(true);
    setError("");
    
    try {
      const selectedBot = aviatorBots.find(bot => bot.id === selectedBotId);
      
      const response = await licenseApi.createLicense({
        email: email.trim(),
        durationDays: parseInt(duration),
        aviatorBotName: selectedBot?.name || '',
        ownerName: ownerName.trim(),
      });

      if (response.success && response.license) {
        setLicenses(prev => [response.license!, ...prev]);
        setLicenseCount(prev => prev + 1);
        setEmail("");
        setOwnerName("");
        
        navigator.clipboard.writeText(response.license.key);
        setCopiedKey(response.license.key);
        setTimeout(() => setCopiedKey(""), 3000);
      } else {
        setError(response.message || 'Failed to create license');
      }
    } catch (error) {
      console.error('Error creating license:', error);
      setError('Unable to create license. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const toggleLicenseStatus = async (id: string) => {
    try {
      const response = await licenseApi.toggleLicenseStatus(id);
      if (response.success) {
        await loadLicenses();
      } else {
        setError(response.message || 'Failed to update license status');
      }
    } catch (error) {
      console.error('Error toggling license status:', error);
      setError('Unable to update license status');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const activeLicenses = licenses.filter(l => l.isActive && !isExpired(l.expirationDate));
  const expiredLicenses = licenses.filter(l => isExpired(l.expirationDate));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Turbo Predictor Expert License Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <SubdomainNavigation />
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Generate and manage license keys for Turbo Predictor Expert application ({licenseCount}/1000 licenses used)
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-red-800">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError("")}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>

        {/* Bot Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield size={20} />
              Bot Name Management
            </h2>
            <Button
              onClick={() => setShowNewBotForm(!showNewBotForm)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Bot
            </Button>
          </div>

          {showNewBotForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Bot name (e.g., TURBO PREDICTOR PRO)"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  disabled={isCreatingBot}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  disabled={isCreatingBot}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateBot}
                    disabled={!newBotName.trim() || isCreatingBot}
                    className="flex-1"
                  >
                    {isCreatingBot ? "Creating..." : "Create Bot"}
                  </Button>
                  <Button
                    onClick={() => setShowNewBotForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bot Name for License Generation
            </label>
            <select 
              value={selectedBotId} 
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a bot name...</option>
              {aviatorBots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name} {bot.description && `- ${bot.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* License Generation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key size={20} />
            Generate New License
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <Input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="OWNER FX"
                disabled={isCreating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days)
              </label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                disabled={isCreating}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <Button
                onClick={handleGenerateLicense}
                disabled={!email.trim() || !selectedBotId || !ownerName.trim() || isCreating || licenseCount >= 1000}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? "Generating..." : "Generate License"}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">{activeLicenses.length}</h3>
                <p className="text-green-600">Active Licenses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <Calendar className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-800">{expiredLicenses.length}</h3>
                <p className="text-red-600">Expired Licenses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Users className="text-gray-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{licenses.length}/1000</h3>
                <p className="text-gray-600">Total Licenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* License List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your License Keys</h2>
            <Button 
              onClick={loadLicenses} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">Loading licenses...</p>
          ) : licenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No licenses generated yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">License Key</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Bot Name</th>
                    <th className="text-left py-3 px-4">Owner</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Expires</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr key={license.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {license.key}
                          </code>
                          <button
                            onClick={() => copyToClipboard(license.key)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copiedKey === license.key ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">{license.email}</td>
                      <td className="py-3 px-4">{license.aviatorBotName || 'N/A'}</td>
                      <td className="py-3 px-4">{license.ownerName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {new Date(license.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(license.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          !license.isActive 
                            ? 'bg-gray-100 text-gray-800'
                            : isExpired(license.expirationDate)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {!license.isActive 
                            ? 'Inactive'
                            : isExpired(license.expirationDate)
                            ? 'Expired'
                            : 'Active'
                          }
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => toggleLicenseStatus(license.id)}
                          variant="outline"
                          size="sm"
                        >
                          {license.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicensingSystem;
