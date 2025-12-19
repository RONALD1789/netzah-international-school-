
import React, { useState, useMemo } from 'react';
import { User, UserRole, SystemBranding } from '../types';
import { CLASSES } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  branding: SystemBranding;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, branding, users }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('teacher');
  const [assignedClass, setAssignedClass] = useState<string>(CLASSES[0]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const quotaError = useMemo(() => {
    if (!isRegister) return null;

    if (role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount >= 2) return "Registration Closed: Maximum of 2 Administrators already reached.";
    }

    if (role === 'headteacher') {
      const headCount = users.filter(u => u.role === 'headteacher').length;
      if (headCount >= 2) return "Registration Closed: Maximum of 2 Headteachers already reached.";
    }

    if (role === 'accountant') {
      const accountantCount = users.filter(u => u.role === 'accountant').length;
      if (accountantCount >= 2) return "Registration Closed: Maximum of 2 Accountants already reached.";
    }

    if (role === 'teacher') {
      const teacherCount = users.filter(u => u.role === 'teacher' && u.assignedClass === assignedClass).length;
      if (teacherCount >= 2) return `Registration Closed: ${assignedClass} class already has 2 registered teachers.`;
    }

    return null;
  }, [isRegister, role, assignedClass, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quotaError) return;

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (email.split('@')[0]),
      email,
      role,
      assignedClass: role === 'teacher' ? assignedClass : undefined
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen custom-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-8 text-center border-b border-gray-100 bg-gray-50">
          <img 
            src={branding.logoUrl} 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-4 p-2 bg-white rounded-lg shadow-sm"
          />
          <h2 className="text-2xl font-bold text-slate-800 playfair">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? `Join the ${branding.schoolName} community` : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <input 
              type="password" required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
            <select 
              value={role} onChange={e => setRole(e.target.value as UserRole)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all cursor-pointer font-bold"
            >
              <option value="teacher">👩‍🏫 Teacher</option>
              <option value="parent">👨‍👩‍👧 Parent</option>
              <option value="headteacher">🎓 Headteacher</option>
              <option value="admin">👨‍💼 Administrator</option>
              <option value="accountant">💰 Accountant</option>
              <option value="librarian">📚 Librarian</option>
              <option value="staff">🔧 Staff Member</option>
            </select>
          </div>

          {isRegister && role === 'teacher' && (
            <div className="animate-slideDown">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Class</label>
              <select 
                value={assignedClass} onChange={e => setAssignedClass(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all cursor-pointer font-bold"
              >
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          {quotaError ? (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-[10px] text-rose-700 font-black uppercase tracking-widest leading-relaxed">
              ⚠️ {quotaError}
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-[10px] text-blue-900 font-bold uppercase tracking-widest leading-relaxed">
              {isRegister ? "Note: Registration for restricted roles is subject to strictly enforced quotas (2 per role/class)." : "Sign in to your authorized portal."}
            </div>
          )}

          <button 
            type="submit"
            disabled={!!quotaError}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 mt-4 uppercase tracking-widest text-xs ${quotaError ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 text-white'}`}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="p-6 bg-gray-50 text-center text-sm border-t border-gray-100">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-900 font-bold hover:underline uppercase tracking-widest text-xs"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
