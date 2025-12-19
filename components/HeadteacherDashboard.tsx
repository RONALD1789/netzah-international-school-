
import React, { useState, useEffect } from 'react';
import { ProgressReport, User, Message, LeaveApplication, Requisition } from '../types';
import { CLASS_SKILL_DATA, CLASSES } from '../constants';

interface HeadteacherDashboardProps {
  user: User;
  reports: ProgressReport[];
  users: User[];
  messages: Message[];
  leaveApplications: LeaveApplication[];
  requisitions: Requisition[];
  onUpdateReport: (report: ProgressReport) => void;
  onSendMessage: (msg: Message) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected', remarks: string) => void;
  onUpdateRequisitionStatus: (id: string, status: 'approved' | 'rejected') => void;
}

const HeadteacherDashboard: React.FC<HeadteacherDashboardProps> = ({ 
  user, reports, users, messages, leaveApplications, requisitions, 
  onUpdateReport, onSendMessage, onEditMessage, onDeleteMessage, onMarkThreadRead,
  onUpdateLeaveStatus, onUpdateRequisitionStatus
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'staff' | 'staff_requests'>('reviews');
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [remarks, setRemarks] = useState('');
  const [staffMsg, setStaffMsg] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const pending = reports.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const teachers = users.filter(u => u.role === 'teacher');

  useEffect(() => {
    if (activeTab === 'staff' && selectedTeacher) {
      onMarkThreadRead(selectedTeacher.id);
    }
  }, [selectedTeacher, activeTab, messages.length]);

  const handleApprove = () => {
    if (!selectedReport) return;
    onUpdateReport({ ...selectedReport, status: 'approved', headRemarks: remarks });
    setSelectedReport(null);
    setRemarks('');
  };

  const handleRevision = () => {
    if (!selectedReport) return;
    const note = prompt("Please provide a reason for revision:");
    if (note) {
      onUpdateReport({ ...selectedReport, status: 'revision_requested', revisionNote: note });
      setSelectedReport(null);
    }
  };

  const handleSendStaffMsg = () => {
    if (!selectedTeacher || !staffMsg.trim()) return;
    onSendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      threadId: selectedTeacher.id,
      content: staffMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    });
    setStaffMsg('');
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-[32px] shadow-2xl mb-8 border border-slate-50 max-w-2xl mx-auto">
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 ${activeTab === 'reviews' ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <span>👨‍⚖️</span> Academic Reviews
        </button>
        <button 
          onClick={() => setActiveTab('staff_requests')}
          className={`px-6 py-3 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 ${activeTab === 'staff_requests' ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <span>📋</span> Staff Requests
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-6 py-3 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 ${activeTab === 'staff' ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <span>👩‍🏫</span> Staff Hub
        </button>
      </div>

      {activeTab === 'staff_requests' && (
        <div className="space-y-10 animate-fadeIn">
          <section className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden">
             <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Leave Review Queue</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Applicant</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Type & Dates</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaveApplications.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-6">
                           <p className="font-black text-slate-800">{l.userName}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-black">{l.staffId}</p>
                        </td>
                        <td className="px-10 py-6">
                           <p className="font-bold text-slate-700">{l.type} Leave</p>
                           <p className="text-xs text-slate-500">{l.startDate} to {l.endDate}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : l.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{l.status}</span>
                        </td>
                        <td className="px-10 py-6 text-right space-x-2">
                           {l.status === 'pending' && (
                             <>
                               <button onClick={() => { const r = prompt("Headteacher Remarks:"); onUpdateLeaveStatus(l.id, 'approved', r || ''); }} className="bg-emerald-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl">Seal Approval</button>
                               <button onClick={() => { const r = prompt("Reason for Rejection:"); onUpdateLeaveStatus(l.id, 'rejected', r || ''); }} className="bg-rose-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl">Decline</button>
                             </>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </section>

          <section className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden">
             <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Requisition Audit</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Requester</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requisitions.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-6">
                           <p className="font-black text-slate-800">{r.userName}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-black">{r.id.toUpperCase()}</p>
                        </td>
                        <td className="px-10 py-6">
                           <p className="font-bold text-slate-700">{r.totalAmount.toLocaleString()} UGX</p>
                           <p className="text-xs text-slate-500">{r.date}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
                        </td>
                        <td className="px-10 py-6 text-right space-x-2">
                           {r.status === 'pending' && (
                             <>
                               <button onClick={() => onUpdateRequisitionStatus(r.id, 'approved')} className="bg-emerald-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl">Verify & Approve</button>
                               <button onClick={() => onUpdateRequisitionStatus(r.id, 'rejected')} className="bg-rose-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl">Decline</button>
                             </>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'reviews' && (
        <>
          <div className="bg-indigo-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-3xl font-black mb-2">Academic Review Center</h2>
               <p className="opacity-80">You have <span className="font-black text-teal-400">{pending.length}</span> reports waiting for your final seal of approval.</p>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-8 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {CLASSES.map(className => {
                const classPending = pending.filter(r => r.childClass === className);
                if (classPending.length === 0) return null;

                return (
                  <div key={className} className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <h3 className="font-black text-indigo-900 uppercase text-[10px] tracking-[0.3em]">{className}</h3>
                      <span className="bg-indigo-100 text-indigo-900 text-[9px] font-black px-2 py-0.5 rounded-full">{classPending.length}</span>
                    </div>
                    {classPending.map(r => (
                      <button 
                        key={r.id} 
                        onClick={() => setSelectedReport(r)}
                        className={`w-full text-left p-6 rounded-[32px] border-2 transition-all ${selectedReport?.id === r.id ? 'border-indigo-600 bg-indigo-50 shadow-md translate-x-2' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}
                      >
                        <p className="font-black text-slate-800 text-lg">{r.learnerName}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{r.term} • {r.academicYear}</p>
                      </button>
                    ))}
                  </div>
                );
              })}
              {pending.length === 0 && (
                <div className="py-20 bg-white rounded-[40px] border-4 border-dashed border-gray-200 text-center">
                  <p className="text-4xl mb-4">✨</p>
                  <p className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">Registry is Current</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 animate-slideIn space-y-10">
                  <div className="flex justify-between items-center border-b pb-6">
                    <div>
                       <h3 className="text-2xl font-black text-indigo-900 uppercase">{selectedReport.childClass} Preview</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reviewing teacher inputs for {selectedReport.learnerName}</p>
                    </div>
                    <button onClick={() => setSelectedReport(null)} className="text-slate-300 hover:text-slate-600 text-2xl font-black">&times;</button>
                  </div>

                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     {(Object.entries(selectedReport.assessments) as [string, any][]).map(([id, data]) => (
                        <div key={id} className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                           <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-3">
                              <span className="text-xl">{CLASS_SKILL_DATA[selectedReport.childClass]?.find(c => (c as any).id === id)?.icon || '📚'}</span>
                              <h4 className="font-black text-slate-700 uppercase text-xs tracking-tight">{data.name}</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(Object.entries(data.skills) as [string, any][]).map(([skill, grade]) => (
                                 <div key={skill} className="flex justify-between items-center text-[11px] p-2 bg-white rounded-xl shadow-sm">
                                    <span className="font-bold text-slate-500 truncate mr-3">{skill}</span>
                                    <span className={`font-black px-2 py-0.5 rounded-lg ${grade === 'EE' ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-900 bg-indigo-50'}`}>{grade}</span>
                                 </div>
                              ))}
                           </div>
                           {data.comment && (
                              <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-dashed border-slate-200 text-xs italic text-slate-500">
                                 "{data.comment}"
                              </div>
                           )}
                        </div>
                     ))}
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="p-8 bg-indigo-50 rounded-[40px] border-2 border-indigo-100 shadow-inner">
                      <label className="block text-xs font-black text-indigo-900 uppercase tracking-widest mb-4">Final Remarks from Head of School</label>
                      <textarea 
                        className="w-full p-6 bg-white border-2 border-transparent focus:border-indigo-600 rounded-3xl h-32 outline-none shadow-sm font-medium italic"
                        placeholder="Enter your final assessment summary here..."
                        value={remarks} onChange={e => setRemarks(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        onClick={handleApprove}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 uppercase text-xs tracking-widest"
                      >
                        ✅ Final Approve & Release
                      </button>
                      <button 
                        onClick={handleRevision}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-amber-100 transition-all active:scale-95 uppercase text-xs tracking-widest"
                      >
                        ⚠️ Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center bg-white rounded-[50px] border-4 border-dashed border-gray-100 p-20 text-center shadow-inner">
                  <div className="animate-pulse">
                    <p className="text-6xl mb-6 opacity-30">🔍</p>
                    <p className="font-black text-slate-300 uppercase tracking-widest text-sm">Select a submission from the sidebar categories</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'staff' && (
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
                                    <p className={`text-[9px] font-black uppercase mt-2 opacity-60 ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>{m.timestamp}</p>
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
                    value={staffMsg} 
                    onChange={e => setStaffMsg(e.target.value)}
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

export default HeadteacherDashboard;
