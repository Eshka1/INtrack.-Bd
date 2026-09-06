import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { LogIn, Lock, Mail, AlertCircle, Layers } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useTenant();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#141b18] border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-[#8b968f] mt-1">Log in to your company workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8b968f] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8b968f] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#06130e] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Log In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center text-xs text-[#8b968f]">
          Don't have a company account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-semibold ml-1">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;