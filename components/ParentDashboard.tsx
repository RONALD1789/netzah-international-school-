
import React, { useState, useEffect, useRef } from 'react';
import { ProgressReport, User, Invoice, PaymentRecord, Message, Student } from '../types';
import OfficialReportView from './OfficialReportView';

interface ParentDashboardProps {
  user: User;
  reports: ProgressReport[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  messages: Message[];
  students: Student[];
  onSendMessage: (msg: Message) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ 
  user, reports, invoices, payments, messages, students, onSendMessage, onEditMessage, onDeleteMessage, onMarkThreadRead 
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'progress' | 'fees' | 'messages' | 'handbook'>('reports');
  const [viewingReport, setViewingReport] = useState<ProgressReport | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const student = students.find(s => s.id === user.studentId);
  const threadId = student?.id || 'general';

  useEffect(() => {
    if (activeTab === 'messages') {
      onMarkThreadRead(threadId);
    }
  }, [activeTab, messages.length, threadId]);

  if (!student) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fadeIn">
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100 text-center max-w-xl">
           <div className="w-32 h-32 bg-amber-50 rounded-[50px] flex items-center justify-center text-6xl mx-auto mb-8 shadow-inner animate-pulse">⏳</div>
           <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">Account Pending Assignment</h2>
           <p className="text-slate-500 font-bold leading-relaxed mb-8">
             Welcome, {user.name}! Your parent account has been created successfully. 
             The school administrator is currently linking your profile to your child's student record. 
             Please check back shortly or contact the front office.
           </p>
           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-xs text-slate-400">
             Registered Email: {user.email}
           </div>
        </div>
      </div>
    );
  }

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalInvoiced - totalPaid;

  const threadMessages = messages.filter(m => m.threadId === threadId);

  const handleSend = () => {
    if (!msgContent.trim()) return;
    onSendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      threadId: threadId,
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

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="custom-gradient text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div>
              <h2 className="text-4xl font-black mb-4 flex items-center gap-3">
                <span className="p-3 bg-white/20 rounded-3xl">👋</span> Welcome
              </h2>
              <p className="opacity-90 font-black text-xl tracking-tight">Parent portal for <span className="underline decoration-teal-400 decoration-4">{student.name}</span></p>
           </div>
           <div className="bg-white/10 p-6 rounded-[40px] backdrop-blur-md border border-white/20 text-center min-w-[200px]">
              <p className="text-3xl font-black">UGX {(balance).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Balance</p>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-[32px] shadow-xl border border-slate-50">
         <TabBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Academic Vault" icon="📑" />
         <TabBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} label="Academic Progress" icon="📈" />
         <TabBtn active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} label="Fees & Payments" icon="💰" />
         <TabBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="School Notices" icon="💬" />
         <TabBtn active={activeTab === 'handbook'} onClick={() => setActiveTab('handbook')} label="Handbook" icon="📘" />
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-10">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Official Academic Archive</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Records for {student.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reports.map(report => (
              <div key={report.id} className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-50 hover:shadow-2xl transition-all group relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                         <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{report.term}</h3>
                         <p className="text-sm text-indigo-500 font-black uppercase tracking-widest">{report.academicYear}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-inner">Released</div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="p-6 bg-slate-50 rounded-[32px] text-center border-2 border-slate-100/50">
                         <p className="text-4xl font-black text-indigo-900">{report.daysPresent}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                      </div>
                      <button onClick={() => setViewingReport(report)} className="p-6 bg-indigo-50 rounded-[32px] text-center border-2 border-indigo-100 hover:bg-indigo-100 transition-all group">
                         <p className="text-4xl">📄</p>
                         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">View Online</p>
                      </button>
                    </div>

                    <button 
                      onClick={() => setViewingReport(report)}
                      className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      <span>📥</span> View Official Report
                    </button>
                 </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100">
                 <p className="text-7xl mb-8">📤</p>
                 <h3 className="text-2xl font-black text-slate-800 mb-2">Registry is Clear</h3>
                 <p className="text-slate-400 font-bold max-w-md mx-auto">Academic reports will appear here permanently once released by the Headteacher's office.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-50 animate-fadeIn">
           <h3 className="text-3xl font-black text-slate-800 mb-10 tracking-tighter">Academic Growth Visualization</h3>
           <div className="space-y-12">
              {reports.length > 0 ? (
                Object.entries(reports[0].assessments).map(([id, data]: [string, any]) => (
                  <div key={id} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest">{data.name}</h4>
                      <span className="text-[10px] font-black text-slate-400">Current Status</span>
                    </div>
                    <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="absolute top-0 left-0 h-full bg-indigo-900 rounded-full shadow-lg transition-all duration-1000" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{data.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">
                   No terminal data to visualize progress.
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard label="Total Invoiced" value={totalInvoiced} color="indigo" />
              <SummaryCard label="Paid to Date" value={totalPaid} color="emerald" />
              <SummaryCard label="Outstanding" value={balance} color="rose" />
           </div>

           <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                 <h4 className="text-xl font-black text-slate-800">Billing History</h4>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50">
                       <tr>
                          <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Reference</th>
                          <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                          <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                          <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {invoices.map(inv => (
                          <tr key={inv.id}>
                             <td className="px-10 py-6 font-black text-slate-700">{inv.items[0]?.description || 'School Fees'}</td>
                             <td className="px-10 py-6 font-black text-indigo-900">{inv.total.toLocaleString()} UGX</td>
                             <td className="px-10 py-6 text-xs font-bold text-slate-400">{inv.date}</td>
                             <td className="px-10 py-6">
                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                   {inv.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              {invoices.length === 0 && <p className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No invoices found for this student.</p>}
           </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-[60px] shadow-2xl border border-slate-100 flex flex-col h-[600px] overflow-hidden animate-fadeIn">
           <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                 <h4 className="text-xl font-black tracking-tight">Verified Communication Channel</h4>
                 <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Active Thread for {student.name}</p>
              </div>
              <span className="bg-white/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Official Portal</span>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth">
              {threadMessages.map(m => {
                const isSystem = m.senderId === 'SYSTEM_OFFICE';
                return (
                  <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-6 rounded-[32px] shadow-sm animate-slideUp relative group
                        ${m.senderId === user.id 
                          ? 'bg-indigo-900 text-white rounded-br-none' 
                          : isSystem 
                            ? 'bg-white text-indigo-900 border-l-8 border-indigo-900 rounded-bl-none font-bold' 
                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                        
                        {isSystem && (
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-50">
                             <span className="text-xl">📜</span>
                             <span className="text-[10px] font-black uppercase tracking-widest">Official Notice</span>
                          </div>
                        )}

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
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isSystem ? 'font-serif text-slate-800 italic' : 'font-medium'}`}>
                              {m.content}
                            </p>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center gap-2">
                                 <p className={`text-[9px] font-black uppercase opacity-60 ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>{m.senderName} • {m.timestamp}</p>
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
                );
              })}
           </div>

           <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <input 
                value={msgContent} 
                onChange={e => setMsgContent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message to the class teacher..." 
                className="flex-1 p-5 bg-slate-50 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm transition-all shadow-inner"
              />
              <button 
                onClick={handleSend}
                className="bg-indigo-900 text-white p-5 rounded-[24px] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                 <span className="text-xl">🚀</span>
              </button>
           </div>
        </div>
      )}

      {activeTab === 'handbook' && (
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100 animate-fadeIn space-y-12">
           <div className="max-w-4xl mx-auto space-y-10">
              <section>
                 <h2 className="text-3xl font-black text-indigo-900 mb-6 border-b-4 border-indigo-50 pb-2">Parent Handbook</h2>
                 <p className="text-slate-600 font-medium leading-relaxed mb-4">
                   Netzah International School is committed to providing biblically based, age-appropriate experiences to allow each child progress at his / her own level of ability while enjoying feelings of success.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <h4 className="font-black text-indigo-900 mb-2">Philosophy</h4>
                       <p className="text-xs text-slate-500 leading-relaxed font-bold italic">"Nurturing & Training for Victory"</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <h4 className="font-black text-indigo-900 mb-2">Schedule</h4>
                       <p className="text-xs text-slate-500 leading-relaxed font-bold">Monday – Friday: 7:30 AM – 5:00 PM</p>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      )}

      {viewingReport && <OfficialReportView report={viewingReport} onClose={() => setViewingReport(null)} />}
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button onClick={onClick} className={`px-6 py-4 rounded-[24px] font-black text-xs transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const SummaryCard = ({ label, value, color }: { label: string, value: number, color: 'indigo' | 'emerald' | 'rose' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    rose: 'bg-rose-50 text-rose-900 border-rose-100'
  };
  return (
    <div className={`p-8 rounded-[40px] border-2 ${colors[color]} shadow-xl text-center`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="text-2xl font-black">{value.toLocaleString()} UGX</p>
    </div>
  );
};

export default ParentDashboard;
