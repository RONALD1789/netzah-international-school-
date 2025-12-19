
import React, { useState } from 'react';
import { User, Message, SystemBranding } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  messages?: Message[];
  branding: SystemBranding;
  onMarkAllRead?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, messages = [], branding, onMarkAllRead }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <header className="sticky top-0 z-[100] w-full px-4 pt-6 pb-2 md:px-12 pointer-events-none no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-effect text-slate-900 p-2 pl-4 pr-3 rounded-[32px] shadow-2xl border border-white/50 pointer-events-auto">
        
        {/* Brand Section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-slate-100 transition-transform hover:scale-110 cursor-pointer">
            <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-slate-900">{branding.schoolName}</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-teal-600 mt-1">{branding.motto}</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-3">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && onMarkAllRead) onMarkAllRead();
              }}
              className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-[20px] flex items-center justify-center transition-all active:scale-90 border border-slate-200/50"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-6 w-96 bg-white rounded-[32px] shadow-2xl overflow-hidden z-50 border border-slate-100 animate-in">
                  <div className="p-8 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                     <div>
                        <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest">Notification Desk</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{messages.length} Active communications</p>
                     </div>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto">
                    {messages.length > 0 ? (
                      messages.slice().reverse().map(m => (
                        <div key={m.id} className={`p-6 border-b border-slate-50 transition-all ${!m.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                          <div className="flex justify-between items-start mb-2">
                             <p className="text-xs font-black text-indigo-900">{m.senderName}</p>
                             <span className="text-[8px] font-black text-slate-300 uppercase">{m.timestamp}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-2">{m.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-16 text-center">
                         <div className="text-5xl mb-6 grayscale opacity-20">📫</div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Your inbox is clear</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-xs font-black uppercase tracking-tight text-slate-900">{user.name}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-600 mt-0.5">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              Sign Out <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
