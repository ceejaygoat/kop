
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LicensingLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - in real implementation, validate credentials
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center mb-8">
          <div className="bg-green-600 p-4 rounded-lg mr-4">
            <img 
              src="/lovable-uploads/5f23fca7-ce16-4579-abe9-ff38d65ab2c7.png" 
              alt="Aviator Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-600">Turbo Aviator Expert</h1>
            <p className="text-sm text-gray-600">License Management System</p>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <a href="#" className="text-blue-500 hover:text-blue-700 text-sm">
            Activate your account
          </a>
          <div className="text-sm text-gray-500">
            <p>Forgot password?</p>
            <p>Only admins with an account! Sign Up</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-center">
          <p>Terms of use. Privacy policy designed and coded by</p>
          <p>TurboAviatorExpert</p>
        </div>
      </div>
    </div>
  );
};

export default LicensingLogin;
