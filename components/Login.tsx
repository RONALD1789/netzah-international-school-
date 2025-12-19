
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
      const count = users.filter(u => u.role === 'admin').length;
      if (count >= 2) return "Administrator Quota Reached (Max 2 total).";
    }
    if (role === 'headteacher') {
      const count = users.filter(u => u.role === 'headteacher').length;
      if (count >= 2) return "Headteacher Quota Reached (Max 2 total).";
    }
    if (role === 'accountant') {
      const count = users.filter(u => u.role === 'accountant').length;
      if (count >= 2) return "Finance Officer Quota Reached (Max 2 total).";
    }
    if (role === 'teacher') {
      const count = users.filter(u => u.role === 'teacher' && u.assignedClass === assignedClass).length;
      if (count >= 2) return `${assignedClass} Teacher Quota Reached (Max 2 per class).`;
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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Branding Side (Desktop) */}
      <div className="hidden lg:flex w-[45%] custom-gradient relative flex-col items-center justify-center p-20 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full -mr-48 -mt-48 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full -ml-48 -mb-48 blur-[120px]"></div>
        
        <div className="relative z-10 text-center space-y-12 max-w-lg flex flex-col items-center">
          {/* Increased Logo Size for Desktop */}
          <div className="w-80 h-80 bg-white rounded-[80px] p-12 border-8 border-white/10 flex items-center justify-center shadow-[0_48px_100px_-15px_rgba(0,0,0,0.7)] animate-in transform hover:scale-105 transition-transform duration-500">
            <img 
              src={branding.logoUrl} 
              alt="Netzah Logo" 
              className="w-full h-full object-contain filter drop-shadow-sm" 
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none playfair">
              Netzah <br/><span className="text-teal-400">International</span>
            </h1>
            <div className="h-1.5 w-24 bg-teal-400/30 mx-auto rounded-full"></div>
            <p className="text-xl font-light text-slate-300 italic tracking-wide">"Nurturing & Training for Victory"</p>
          </div>
          
          <div className="pt-16 grid grid-cols-2 gap-16 border-t border-white/10 w-full">
            <div>
              <p className="text-4xl font-black text-white">ACE</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-black mt-1">Standard</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white">5 Yrs</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-black mt-1">Heritage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#FBFBFE]">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Mobile Logo View - Increased Size */}
          <div className="lg:hidden mb-12 text-center flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-[48px] p-6 shadow-2xl border border-slate-100 flex items-center justify-center mb-8">
               <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Netzah International School</h2>
            <div className="h-1 w-12 bg-teal-500 rounded-full mt-4"></div>
          </div>

          <div className="w-full text-center space-y-3 mb-10">
            <h2 className={`font-black text-slate-900 tracking-tight leading-tight ${isRegister ? 'text-4xl' : 'text-xl uppercase tracking-wider'}`}>
              {isRegister ? 'Portal Registration' : 'Nurturing and Training for Victory'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isRegister ? 'Create your official credentials below.' : 'Please authenticate to access your dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Official Name</label>
                <input 
                  required value={name} onChange={e => setName(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-slate-800 shadow-sm"
                  placeholder="Sarah Namukasa"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-slate-800 shadow-sm"
                placeholder="office@netzah.ac.ug"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Role</label>
              <div className="relative">
                <select 
                  value={role} onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-black text-xs uppercase tracking-widest cursor-pointer shadow-sm appearance-none"
                >
                  <option value="teacher">👩‍🏫 Class Teacher</option>
                  <option value="parent">👨‍👩‍👧 Parent / Guardian</option>
                  <option value="headteacher">🎓 Headteacher</option>
                  <option value="admin">👨‍💼 Administrator</option>
                  <option value="accountant">💰 Finance Officer</option>
                  <option value="librarian">📚 Librarian</option>
                  <option value="staff">🔧 General Staff</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</span>
              </div>
            </div>

            {isRegister && role === 'teacher' && (
              <div className="space-y-2 animate-in">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Classroom</label>
                <div className="relative">
                  <select 
                    value={assignedClass} onChange={e => setAssignedClass(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-black text-xs uppercase tracking-widest cursor-pointer shadow-sm appearance-none"
                  >
                    {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</span>
                </div>
              </div>
            )}

            {quotaError && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-in">
                <span className="text-xl">⚠️</span>
                <p className="text-[11px] font-black text-rose-700 leading-tight uppercase tracking-tight">
                  {quotaError}
                </p>
              </div>
            )}

            <button 
              type="submit"
              disabled={!!quotaError}
              className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${quotaError ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200 hover:-translate-y-1'}`}
            >
              {isRegister ? 'Complete Verification' : 'Authenticate User'}
              <span className="text-lg">➜</span>
            </button>
          </form>

          <div className="w-full pt-10 mt-10 border-t border-slate-100 flex flex-col items-center space-y-6">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-teal-600 transition-colors"
            >
              {isRegister ? 'Back to Secure Sign In' : 'New Faculty? Request Account Credentials'}
            </button>
            <div className="flex items-center gap-6 opacity-30">
               <span className="h-px w-10 bg-slate-400"></span>
               <p className="text-[8px] font-black uppercase tracking-[0.5em]">Netzah 2025</p>
               <span className="h-px w-10 bg-slate-400"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
