import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, ArrowRight, Activity, Key, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('member');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      // Re-fetch user in context is handled within login()
      const storedUser = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      // The login response in context already sets the user. 
      // We just need to navigate based on the role we just got.
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  // The AuthContext update will trigger a re-render. We can use a useEffect or just check user here.
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') navigate('/admin');
    else navigate('/member');
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl space-y-8 z-10"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
              <Activity className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic">Work Process Tracker</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">Mission Control Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
           <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center space-x-3 text-rose-400 text-xs font-bold uppercase tracking-widest italic"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                required
                type="text"
                placeholder="Username"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest leading-relaxed text-center italic">
              Demo Credentials: admin / admin123
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center group uppercase tracking-widest leading-loose"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Initialize Session
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose font-bold italic">
            Secure Enterprise Node v3.1
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
