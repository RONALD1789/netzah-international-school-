
import React, { useState } from 'react';
import { SystemSettings as SettingsType, SchoolInfo } from '../types';

interface SystemSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ settings, onUpdateSettings, onBackup, onRestore }) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'security' | 'schools' | 'data'>('branding');
  const [localBranding, setLocalBranding] = useState(settings.branding);

  const handleSaveBranding = () => {
    onUpdateSettings({ ...settings, branding: localBranding });
    alert("Branding updated successfully!");
  };

  const handleSecurityToggle = (key: keyof SettingsType['security']) => {
    const newSecurity = { ...settings.security, [key]: !settings.security[key] };
    onUpdateSettings({ ...settings, security: newSecurity as any });
  };

  const handleSchoolChange = (idx: number, field: keyof SchoolInfo, value: string) => {
    const newSchools = [...settings.schools];
    (newSchools[idx] as any)[field] = value;
    onUpdateSettings({ ...settings, schools: newSchools });
  };

  return (
    <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
        {/* Sidebar Nav */}
        <div className="bg-slate-50 p-10 border-r border-slate-100 flex flex-col gap-4">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">System Config</h3>
           <SettingsNavBtn active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} label="Branding" icon="🎨" />
           <SettingsNavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Security" icon="🛡️" />
           <SettingsNavBtn active={activeTab === 'schools'} onClick={() => setActiveTab('schools')} label="Multi-School" icon="🏫" />
           <SettingsNavBtn active={activeTab === 'data'} onClick={() => setActiveTab('data')} label="Data Management" icon="💾" />
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 p-12 space-y-10">
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-fadeIn">
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Custom Branding</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">School Name</label>
                     <input 
                       className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] font-bold outline-none" 
                       value={localBranding.schoolName}
                       onChange={e => setLocalBranding({...localBranding, schoolName: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Motto</label>
                     <input 
                       className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] font-bold outline-none" 
                       value={localBranding.motto}
                       onChange={e => setLocalBranding({...localBranding, motto: e.target.value})}
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Logo URL (Secure Link)</label>
                     <input 
                       className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] font-bold outline-none" 
                       value={localBranding.logoUrl}
                       onChange={e => setLocalBranding({...localBranding, logoUrl: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Accent Color</label>
                     <div className="flex gap-4 items-center">
                        <input type="color" className="w-14 h-14 rounded-xl cursor-pointer" value={localBranding.primaryColor} onChange={e => setLocalBranding({...localBranding, primaryColor: e.target.value})} />
                        <span className="font-mono text-xs font-black">{localBranding.primaryColor}</span>
                     </div>
                  </div>
               </div>
               <button onClick={handleSaveBranding} className="bg-indigo-900 text-white px-10 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95">
                 Save Branding Preferences
               </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-fadeIn">
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Security & Authentication</h3>
               <div className="space-y-6">
                  <SecurityToggle 
                    label="Maintenance Mode" 
                    desc="Lock all portal access for non-admin users during updates." 
                    active={settings.security.maintenanceMode} 
                    onToggle={() => handleSecurityToggle('maintenanceMode')} 
                  />
                  <SecurityToggle 
                    label="Force Two-Factor Authentication" 
                    desc="Require staff to verify their login via mobile OTP." 
                    active={settings.security.requireTwoFactor} 
                    onToggle={() => handleSecurityToggle('requireTwoFactor')} 
                  />
                  <div className="flex justify-between items-center p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                     <div className="max-w-md">
                        <p className="font-black text-slate-800">Password Complexity Policy</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">Define strictness for user credentials.</p>
                     </div>
                     <select 
                      className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none"
                      value={settings.security.passwordComplexity}
                      onChange={e => onUpdateSettings({...settings, security: {...settings.security, passwordComplexity: e.target.value as any}})}
                     >
                        <option value="low">Standard</option>
                        <option value="medium">Enhanced</option>
                        <option value="high">Strict (ACE Standard)</option>
                     </select>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'schools' && (
            <div className="space-y-8 animate-fadeIn">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">School Entities</h3>
                  <button className="text-[10px] font-black text-indigo-900 bg-indigo-50 px-4 py-2 rounded-xl uppercase">+ Add Branch</button>
               </div>
               <div className="space-y-6">
                  {settings.schools.map((school, idx) => (
                    <div key={school.id} className="p-8 bg-white border-2 border-slate-100 rounded-[40px] space-y-6 shadow-sm hover:border-indigo-100 transition-all">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full">{school.id}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">Active Context</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Name</label>
                             <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={school.name} onChange={e => handleSchoolChange(idx, 'name', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campus/Location</label>
                             <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={school.campus} onChange={e => handleSchoolChange(idx, 'campus', e.target.value)} />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-10 animate-fadeIn">
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Data Stewardship</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="p-10 bg-indigo-50 rounded-[50px] border-2 border-indigo-100 text-center space-y-6">
                     <div className="text-5xl">📦</div>
                     <div>
                        <h4 className="font-black text-indigo-900 uppercase">Database Export</h4>
                        <p className="text-xs text-indigo-400 mt-2">Download a full JSON archive of all records, reports, and settings.</p>
                     </div>
                     <button onClick={onBackup} className="bg-indigo-900 text-white w-full py-4 rounded-[24px] font-black uppercase text-xs shadow-xl">
                       Export Master Backup
                     </button>
                  </section>

                  <section className="p-10 bg-slate-900 rounded-[50px] text-center space-y-6">
                     <div className="text-5xl">📤</div>
                     <div>
                        <h4 className="font-black text-white uppercase">System Restore</h4>
                        <p className="text-xs text-slate-500 mt-2">Restore database state from a previously exported JSON file.</p>
                     </div>
                     <label className="block w-full">
                        <span className="bg-white text-slate-900 block py-4 rounded-[24px] font-black uppercase text-xs shadow-xl cursor-pointer hover:bg-slate-100 transition-all">
                          Select Backup File
                        </span>
                        <input type="file" className="hidden" accept=".json" onChange={onRestore} />
                     </label>
                  </section>
               </div>

               <div className="p-8 bg-rose-50 rounded-[40px] border-2 border-dashed border-rose-200">
                  <div className="flex gap-4 items-center">
                     <span className="text-2xl">⚠️</span>
                     <div>
                        <p className="text-xs font-black text-rose-900 uppercase">Destructive Action Zone</p>
                        <p className="text-[10px] text-rose-500 font-medium leading-relaxed">Wiping local storage or restoring a backup will overwrite current session data permanently. Ensure an export is saved before proceeding.</p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsNavBtn = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button onClick={onClick} className={`p-4 rounded-[20px] font-black text-xs transition-all flex items-center gap-3 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const SecurityToggle = ({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: () => void }) => (
  <div className="flex justify-between items-center p-8 bg-slate-50 rounded-[40px] border border-slate-100">
     <div className="max-w-md">
        <p className="font-black text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-medium mt-1">{desc}</p>
     </div>
     <button 
       onClick={onToggle}
       className={`w-16 h-8 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
     >
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${active ? 'left-9' : 'left-1'}`}></div>
     </button>
  </div>
);

export default SystemSettings;
