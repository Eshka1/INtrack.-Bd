import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  Briefcase, 
  User, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  Layers 
} from 'lucide-react';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    industry: 'Manufacturing',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    ownerEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { registerCompany } = useTenant();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setSubmitting(true);
    try {
      if (typeof registerCompany === 'function') {
        await registerCompany(formData);
      } else {
        // Direct API fallback if context method signature differs
        const res = await fetch('/api/auth/register-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || 'Registration failed');
        }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-[#141b18] border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        {/* Top Branding & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-3">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Register Your Company</h1>
          <p className="text-sm text-[#8b968f] mt-1.5">Set up your isolated multi-tenant IN-Track workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Company Profile */}
          <div>
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Industrial Ltd"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Company Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="companyEmail"
                    required
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="contact@acme.com"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Industry</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition cursor-pointer appearance-none"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Textiles">Textiles & Apparel</option>
                    <option value="Warehousing">Logistics & Warehousing</option>
                    <option value="Retail">Retail & Distribution</option>
                    <option value="Technology">Technology & Hardware</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+880 1700-000000"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Owner / Admin Profile */}
          <div>
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2">
              <User className="w-4 h-4" /> Owner Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Owner Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="ownerEmail"
                    required
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="john.doe@acme.com"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8b968f] mb-1.5 font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8b968f]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1310] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-[#8b968f]/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#06130e] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Creating Workspace...</span>
            ) : (
              <>
                Register Company <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center text-xs text-[#8b968f]">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline font-semibold ml-1">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCompany;