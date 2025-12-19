
import React, { useState, useEffect } from 'react';
import { ProgressReport, Student, User, Invoice, PaymentRecord, ExpenseRecord, Message, LeaveApplication, Requisition, AuditLog, SystemSettings as SettingsType } from '../types';
import { FEE_STRUCTURE, NEXT_LEVEL, HOUSES, CLASS_SKILL_DATA, CLASSES } from '../constants';
import EnrolmentForm from './EnrolmentForm';
import PromotionCertificate from './PromotionCertificate';
import ComplianceHub from './ComplianceHub';
import SystemSettings from './SystemSettings';

interface AdminDashboardProps {
  user: User;
  reports: ProgressReport[];
  students: Student[];
  users: User[];
  invoices?: Invoice[];
  payments?: PaymentRecord[];
  expenses?: ExpenseRecord[];
  messages: Message[];
  leaveApplications: LeaveApplication[];
  requisitions: Requisition[];
  auditLogs: AuditLog[];
  settings: SettingsType;
  onUpdateReport: (report: ProgressReport) => void;
  onUpdateStudent?: (student: Student) => void;
  onAddStudent: (student: Student) => void;
  onUpdateUser: (user: User) => void;
  onSendMessage: (msg: Message) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected', remarks: string) => void;
  onUpdateRequisitionStatus: (id: string, status: 'approved' | 'rejected') => void;
  onUpdateSettings: (settings: SettingsType) => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, reports, students, users, invoices = [], payments = [], expenses = [], messages, leaveApplications, requisitions, auditLogs, settings,
  onUpdateReport, onUpdateStudent, onAddStudent, onUpdateUser, onSendMessage, onEditMessage, onDeleteMessage, onMarkThreadRead,
  onUpdateLeaveStatus, onUpdateRequisitionStatus, onUpdateSettings, onBackup, onRestore
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'review' | 'fees' | 'promotion' | 'admissions' | 'access' | 'messages' | 'staff_requests' | 'compliance' | 'system'>('insights');
  const [userSearch, setUserSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Mark thread as read when selected or new messages arrive
  useEffect(() => {
    if (activeTab === 'messages' && selectedTeacher) {
      onMarkThreadRead(selectedTeacher.id);
    }
  }, [selectedTeacher, activeTab, messages.length]);

  const enrollmentByClass = CLASSES.map(cls => ({
    name: cls,
    count: students.filter(s => s.className === cls && !s.isGraduated && !s.isTransferred).length
  }));
  const maxEnrollment = Math.max(...enrollmentByClass.map(e => e.count), 1);
  const totalReceived = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSendStaffMsg = () => {
    if (!selectedTeacher || !msgContent.trim()) return;
    onSendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      threadId: selectedTeacher.id,
      content: msgContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    });
    setMsgContent('');
  };

  const handleEdit = (m: Message) => {
    setEditingMessageId(m.id);
    setEditContent(m.content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage(editingMessageId, editContent);
      setEditingMessageId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDeleteMessage(id);
    }
  };

  const teachers = users.filter(u => u.role === 'teacher');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap gap-2 justify-center mb-10 bg-white p-3 rounded-[32px] shadow-2xl border border-slate-50 max-w-[95%] mx-auto overflow-x-auto no-scrollbar">
        <NavPill active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} label="Insights" icon="📊" />
        <NavPill active={activeTab === 'review'} onClick={() => setActiveTab('review')} label="Review Desk" icon="👨‍⚖️" />
        <NavPill active={activeTab === 'staff_requests'} onClick={() => setActiveTab('staff_requests')} label="Staff Requests" icon="📋" />
        <NavPill active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="Staff Chat" icon="💬" />
        <NavPill active={activeTab === 'promotion'} onClick={() => setActiveTab('promotion')} label="Promotions" icon="🎓" />
        <NavPill active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} label="Compliance" icon="🛡️" />
        <NavPill active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="System" icon="⚙️" />
        <NavPill active={activeTab === 'admissions'} onClick={() => setActiveTab('admissions')} label="Admissions" icon="📝" />
        <NavPill active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} label="Finance" icon="💰" />
      </div>

      {activeTab === 'system' && (
        <SystemSettings 
          settings={settings} 
          onUpdateSettings={onUpdateSettings} 
          onBackup={onBackup}
          onRestore={onRestore}
        />
      )}

      {activeTab === 'compliance' && (
        <ComplianceHub 
          students={students} 
          auditLogs={auditLogs} 
          reports={reports}
          onUpdateStudent={onUpdateStudent}
        />
      )}

      {activeTab === 'insights' && (
        <div className="space-y-10 animate-fadeIn">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Real-time Statistics for {settings.branding.schoolName}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Enrollment" value={students.filter(s => !s.isGraduated && !s.isTransferred).length} color="blue" icon="👥" sub="Active Students" />
            <StatCard label="Review Queue" value={reports.filter(r => r.status === 'submitted').length} color="amber" icon="⏳" sub="Pending Approval" />
            <StatCard label="Revenue" value={totalReceived.toLocaleString()} unit={settings.currency} color="emerald" icon="💰" sub="Total Collections" />
            <StatCard label="Staff" value={users.filter(u => u.role !== 'parent').length} color="indigo" icon="👩‍🏫" sub="Active Portal Users" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Enrollment Trends</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class Distribution Analysis</p>
                 </div>
                 <span className="bg-indigo-50 text-indigo-900 px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-inner">Registry Active</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-4 pt-10 px-4">
                 {enrollmentByClass.map(cls => (
                   <div key={cls.name} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="relative w-full flex flex-col items-center">
                        <div 
                          className="w-12 bg-indigo-900 rounded-t-2xl shadow-lg transition-all duration-1000 group-hover:bg-teal-500 group-hover:-translate-y-1"
                          style={{ height: `${(cls.count / maxEnrollment) * 150}px` }}
                        >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-black whitespace-nowrap">
                             {cls.count} Pupils
                           </div>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase text-center h-10 flex items-center">
                        {cls.name.split(' ')[0]}
                      </p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-10 left-10">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Attendance Analytics</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">School Pulse Indicator</p>
               </div>
               <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100" />
                    <circle 
                      cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" 
                      strokeDasharray={502.4} 
                      strokeDashoffset={502.4 - (502.4 * 0.94)} 
                      className="text-teal-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-slate-800">94%</span>
                     <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">School Wide</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 flex flex-col md:flex-row h-[700px] overflow-hidden animate-fadeIn">
          <div className="w-full md:w-80 border-r border-slate-50 flex flex-col bg-slate-50/20">
            <div className="p-8 border-b border-slate-50">
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Teaching Faculty</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Messaging Hub</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {teachers.map(t => {
                 const threadMsgs = messages.filter(m => m.threadId === t.id);
                 const unreadInThread = threadMsgs.filter(m => !m.isRead && m.senderId !== user.id).length;

                 return (
                   <button 
                    key={t.id}
                    onClick={() => setSelectedTeacher(t)}
                    className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 ${selectedTeacher?.id === t.id ? 'bg-indigo-900 text-white shadow-xl' : 'hover:bg-white text-slate-600'}`}
                   >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${selectedTeacher?.id === t.id ? 'bg-white/20' : 'bg-indigo-900 text-white'}`}>
                        {t.name[0]}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <p className="font-black text-sm">{t.name}</p>
                            {unreadInThread > 0 && <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadInThread}</span>}
                         </div>
                         <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedTeacher?.id === t.id ? 'text-white/60' : 'text-slate-400'}`}>{t.assignedClass || 'Unassigned'}</p>
                      </div>
                   </button>
                 );
               })}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            {selectedTeacher ? (
              <>
                <div className="p-8 bg-white border-b border-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white text-xl">✍️</div>
                      <div>
                         <h4 className="text-xl font-black text-slate-800 tracking-tight">Teacher {selectedTeacher.name}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management Direct Channel</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/10">
                   {messages.filter(m => m.threadId === selectedTeacher.id).map(m => (
                     <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-6 rounded-[32px] shadow-sm animate-slideUp relative group ${m.senderId === user.id ? 'bg-indigo-900 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                           
                           {editingMessageId === m.id ? (
                             <div className="space-y-3 min-w-[200px]">
                                <textarea 
                                  value={editContent} 
                                  onChange={e => setEditContent(e.target.value)}
                                  className="w-full p-3 bg-white/10 rounded-xl text-white text-sm outline-none border border-white/20"
                                />
                                <div className="flex gap-2 justify-end">
                                   <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-black uppercase opacity-60">Cancel</button>
                                   <button onClick={handleSaveEdit} className="text-[10px] font-black uppercase bg-white text-indigo-900 px-3 py-1 rounded-lg">Save</button>
                                </div>
                             </div>
                           ) : (
                             <>
                               <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                               <div className="flex justify-between items-center mt-2">
                                 <div className="flex items-center gap-2">
                                   <p className={`text-[9px] font-black uppercase opacity-60 ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>{m.timestamp}</p>
                                   {m.senderId === user.id && (
                                     <div className="flex items-center gap-1">
                                       {m.isRead ? (
                                         <span className="text-teal-400 flex items-center gap-0.5" title={`Read at ${m.readAt}`}>
                                            <span className="text-[10px]">✓✓</span>
                                            <span className="text-[7px] font-black uppercase">Read</span>
                                         </span>
                                       ) : (
                                         <span className="text-white/40 text-[10px]" title="Sent">✓</span>
                                       )}
                                     </div>
                                   )}
                                 </div>
                               </div>

                               {m.senderId === user.id && !editingMessageId && (
                                 <div className="absolute -left-16 top-0 hidden group-hover:flex flex-col gap-1">
                                    <button onClick={() => handleEdit(m)} className="p-2 bg-slate-100 text-indigo-900 rounded-full shadow-sm hover:bg-indigo-100 transition-all text-xs">✏️</button>
                                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-slate-100 text-rose-500 rounded-full shadow-sm hover:bg-rose-100 transition-all text-xs">🗑️</button>
                                 </div>
                               )}
                             </>
                           )}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
                   <input 
                    value={msgContent} 
                    onChange={e => setMsgContent(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendStaffMsg()}
                    placeholder={`Compose directive to ${selectedTeacher.name}...`}
                    className="flex-1 p-5 bg-slate-50 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm transition-all shadow-inner"
                   />
                   <button 
                    onClick={handleSendStaffMsg}
                    className="bg-indigo-900 text-white p-5 rounded-[24px] shadow-xl hover:scale-105 active:scale-95 transition-all"
                   >
                      <span className="text-xl">🚀</span>
                   </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                 <div className="w-32 h-32 bg-indigo-50 rounded-[50px] flex items-center justify-center text-5xl mb-8 shadow-inner animate-pulse">📢</div>
                 <h4 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Select a staff member to initiate communication</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavPill = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const StatCard = ({ label, value, unit, color, icon, sub }: { label: string, value: string | number, unit?: string, color: string, icon: string, sub?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-900 border-blue-100',
    amber: 'bg-amber-50 text-amber-900 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-100',
    slate: 'bg-slate-50 text-slate-900 border-slate-100',
  };
  return (
    <div className={`p-8 rounded-[40px] border-2 ${colors[color]} shadow-2xl group hover:scale-105 transition-all`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-4xl">{icon}</span>
        <div className="text-right">
           <span className="text-3xl font-black tracking-tighter leading-none">{value}</span>
           {unit && <p className="text-[10px] font-black uppercase opacity-60">{unit}</p>}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</p>
      {sub && <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{sub}</p>}
    </div>
  );
};

export default AdminDashboard;
