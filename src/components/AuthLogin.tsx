
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

const AuthLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left side - Robot Image */}
        <div className="w-1/2 relative">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTTYqNPmg9ZIZDFrhCWuU4OlKRtPqMkf2qfqu1PECsIL_poLPjMNKqow0J&s=10" 
            alt="Robot System" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">TBR PREDICTOR</h1>
            <p className="text-sm text-gray-600 italic mb-1">Mobile Aviator System</p>
            <h2 className="text-2xl font-bold text-purple-600">Turbo Expert Predictor</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Sign in</h3>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold rounded-lg"
              >
                {loading ? (isLogin ? "Signing in..." : "Signing up...") : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <a href="#" className="text-blue-500 hover:text-blue-700 text-sm block">
                Activate your account
              </a>
              <div className="text-sm text-gray-500">
                <p>Forgot password?</p>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {isLogin ? "Only admins with an account! Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-xs text-gray-400 text-center">
            <p>Terms of use. Privacy policy designed and coded by</p>
            <p>TurboPredictorExpert</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
