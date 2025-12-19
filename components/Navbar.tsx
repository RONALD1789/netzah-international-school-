
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
    <header className="custom-gradient text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="bg-white p-2 rounded-xl shadow-lg w-14 h-14 flex items-center justify-center overflow-hidden">
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight uppercase leading-none">{branding.schoolName}</h1>
            <p className="text-[10px] italic text-teal-400 font-bold uppercase tracking-widest mt-1">{branding.motto}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && onMarkAllRead) onMarkAllRead();
              }}
              className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg border-2 border-[#1B3A5F]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl overflow-hidden z-50 animate-slideDown border border-slate-100">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-indigo-900 font-black text-sm uppercase tracking-widest">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                      {messages.length} Total
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {messages.length > 0 ? (
                      messages.slice().reverse().map(m => (
                        <div 
                          key={m.id} 
                          className={`p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-4 ${!m.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white text-lg shrink-0">
                            {m.senderId === 'SYSTEM_OFFICE' ? '📜' : '💬'}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-800">{m.senderName}</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {m.content}
                            </p>
                            <p className="text-[9px] font-black text-indigo-400 mt-2 uppercase tracking-widest">{m.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-3xl mb-4 opacity-20">📭</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs font-black opacity-90 uppercase tracking-tight">{user.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-teal-300 font-black">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
