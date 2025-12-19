
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, LeaveApplication, Requisition, Book, BorrowedBook } from '../types';
import LeaveApplicationForm from './LeaveApplicationForm';
import RequisitionForm from './RequisitionForm';

interface StaffDashboardProps {
  user: User;
  messages: Message[];
  leaveApplications: LeaveApplication[];
  requisitions: Requisition[];
  books: Book[];
  borrowings: BorrowedBook[];
  onSendMessage: (msg: Message) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
  onApplyLeave: (leave: LeaveApplication) => void;
  onAddRequisition: (req: Requisition) => void;
  onAddBorrowing: (borrowing: BorrowedBook) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  user, messages, leaveApplications, requisitions, books, borrowings,
  onSendMessage, onEditMessage, onDeleteMessage, onMarkThreadRead, 
  onApplyLeave, onAddRequisition, onAddBorrowing
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'messages' | 'calendar' | 'handbook' | 'leave' | 'requisitions' | 'library'>('notices');
  const [msgContent, setMsgContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // Mark thread as read when viewing messages
  useEffect(() => {
    if (activeTab === 'messages') {
      onMarkThreadRead(user.id);
    }
  }, [activeTab, messages.length]);

  const threadMessages = messages.filter(m => m.threadId === user.id);

  const handleSend = () => {
    if (!msgContent.trim()) return;
    onSendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      threadId: user.id, 
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

  const handleBorrow = (book: Book) => {
    const activeStaffLoans = borrowings.filter(b => b.borrowerId === user.id && b.status === 'borrowed').length;
    if (activeStaffLoans >= 30) {
      alert("Borrowing Limit Reached: You already have 30 books out. Please return some before borrowing more.");
      return;
    }

    if (window.confirm(`Confirm borrowing "${book.title}"?`)) {
      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(borrowDate.getDate() + 14); // 2 weeks for staff

      onAddBorrowing({
        id: Math.random().toString(36).substr(2, 9),
        bookId: book.id,
        bookTitle: book.title,
        borrowerId: user.id,
        borrowerName: user.name,
        borrowerRole: 'staff',
        borrowDate: borrowDate.toLocaleDateString('en-GB'),
        dueDate: dueDate.toLocaleDateString('en-GB'),
        status: 'borrowed',
        fine: 0
      });
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    b.author.toLowerCase().includes(librarySearch.toLowerCase()) ||
    b.category.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const staffLoans = borrowings.filter(b => b.borrowerId === user.id);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="custom-gradient text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div>
              <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                <span className="p-3 bg-white/20 rounded-3xl">👋</span> Staff Portal
              </h2>
              <p className="opacity-90 font-black text-xl tracking-tight">Welcome, {user.name}. How can we help you today?</p>
           </div>
           <div className="bg-white/10 p-6 rounded-[40px] backdrop-blur-md border border-white/20 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Staff ID</p>
              <p className="text-xl font-black uppercase">NIS-STAFF-{user.id.substr(0,4)}</p>
           </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 animate-pulse"></div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-[32px] shadow-xl border border-slate-50 max-w-4xl mx-auto overflow-x-auto no-scrollbar">
         <TabBtn active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} label="Notice Board" icon="📢" />
         <TabBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="Help Desk" icon="💬" />
         <TabBtn active={activeTab === 'library'} onClick={() => setActiveTab('library')} label="Library" icon="📚" />
         <TabBtn active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} label="Leave" icon="🏖️" />
         <TabBtn active={activeTab === 'requisitions'} onClick={() => setActiveTab('requisitions')} label="Requisitions" icon="📦" />
         <TabBtn active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="Calendar" icon="🗓️" />
      </div>

      {activeTab === 'library' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Library Catalog</h3>
                  <input 
                    placeholder="Search books, authors, subjects..." 
                    className="p-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none text-sm font-medium w-64 transition-all"
                    value={librarySearch}
                    onChange={e => setLibrarySearch(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 hover:bg-white hover:shadow-lg transition-all group">
                       <div className="w-20 h-28 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-20">📖</span>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{book.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{book.author}</p>
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-2">{book.category}</p>
                          <button 
                            disabled={book.availableCopies <= 0}
                            onClick={() => handleBorrow(book)}
                            className={`mt-3 w-full py-2 rounded-xl text-[10px] font-black uppercase transition-all ${book.availableCopies > 0 ? 'bg-indigo-900 text-white shadow-md hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                          >
                            {book.availableCopies > 0 ? 'Borrow Book' : 'Out of Stock'}
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
              <section className="bg-indigo-900 text-white p-8 rounded-[40px] shadow-2xl">
                 <h3 className="text-lg font-black uppercase tracking-widest mb-6">My Current Loans</h3>
                 <div className="space-y-4">
                    {staffLoans.filter(l => l.status === 'borrowed').map(loan => (
                      <div key={loan.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                         <p className="font-black text-sm">{loan.bookTitle}</p>
                         <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-black uppercase text-teal-400">Due: {loan.dueDate}</span>
                            <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-500 rounded-full">Active</span>
                         </div>
                      </div>
                    ))}
                    {staffLoans.filter(l => l.status === 'borrowed').length === 0 && (
                      <p className="text-center py-10 text-white/30 font-black uppercase text-xs">No active loans</p>
                    )}
                 </div>
              </section>

              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                 <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-4">Staff Benefits</h3>
                 <ul className="space-y-3">
                    <li className="flex gap-3 text-xs font-medium text-slate-500"><span>✅</span> 30 Book Limit</li>
                    <li className="flex gap-3 text-xs font-medium text-slate-500"><span>✅</span> 14 Day Loan Period</li>
                    <li className="flex gap-3 text-xs font-medium text-slate-500"><span>✅</span> Digital Catalog Access</li>
                 </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-12">
           <LeaveApplicationForm user={user} onSubmit={onApplyLeave} />
           <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 px-4">My Leave History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {leaveApplications.map(l => (
                   <div key={l.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-colors">
                      <div>
                         <p className="font-black text-slate-700">{l.type} Leave</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{l.startDate} to {l.endDate} ({l.totalDays} Days)</p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : l.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{l.status}</span>
                   </div>
                 ))}
                 {leaveApplications.length === 0 && <p className="col-span-full py-10 text-center text-slate-300 font-bold">No leave applications yet.</p>}
              </div>
           </section>
        </div>
      )}

      {activeTab === 'requisitions' && (
        <div className="space-y-12">
           <RequisitionForm user={user} onSubmit={onAddRequisition} />
           <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 px-4">My Requisitions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {requisitions.map(r => (
                   <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-teal-200 transition-colors">
                      <div>
                         <p className="font-black text-slate-700">Ref: #{r.id.toUpperCase()}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{r.date} • {r.items.length} Items</p>
                         <p className="text-sm font-black text-indigo-900 mt-1">{r.totalAmount.toLocaleString()} UGX</p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
                   </div>
                 ))}
                 {requisitions.length === 0 && <p className="col-span-full py-10 text-center text-slate-300 font-bold">No requisitions submitted yet.</p>}
              </div>
           </section>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Official Staff Announcements</h3>
              <span className="bg-indigo-50 text-indigo-900 px-4 py-1 rounded-full text-[10px] font-black uppercase">Live Updates</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <NoticeCard 
                title="End of Term Staff Meeting" 
                date="Dec 15, 2025" 
                content="Mandatory meeting for all staff members regarding the term closure and upcoming graduation ceremony. Location: Assembly Hall." 
                icon="👥"
                color="bg-indigo-900"
              />
              <NoticeCard 
                title="New Health & Safety Policy" 
                date="Dec 10, 2025" 
                content="Please review the updated safety guidelines in the Policies tab. All staff must complete the acknowledgment by Friday." 
                icon="🛡️"
                color="bg-emerald-600"
              />
           </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-[60px] shadow-2xl border border-slate-100 flex flex-col h-[600px] overflow-hidden animate-fadeIn">
           <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                 <h4 className="text-xl font-black tracking-tight">Direct Management Line</h4>
                 <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Confidential Staff Support Channel</p>
              </div>
              <span className="bg-white/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Help Desk</span>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth">
              {threadMessages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-6 rounded-[32px] shadow-sm animate-slideUp relative group
                      ${m.senderId === user.id 
                        ? 'bg-indigo-900 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                      
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
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-2 opacity-60">
                               <p className={`text-[9px] font-black uppercase ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>{m.senderName}</p>
                               <p className={`text-[9px] font-black uppercase ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>{m.timestamp}</p>
                            </div>
                            {m.senderId === user.id && (
                               <div className="flex items-center gap-1">
                                  {m.isRead ? (
                                     <span className="text-teal-400 flex items-center gap-0.5">
                                        <span className="text-[10px]">✓✓</span>
                                        <span className="text-[7px] font-black uppercase">Read</span>
                                     </span>
                                  ) : (
                                     <span className="text-white/40 text-[10px]">✓</span>
                                  )}
                               </div>
                            )}
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
              {threadMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <span className="text-5xl mb-4">💬</span>
                   <p className="font-black text-xs uppercase tracking-[0.3em] max-w-xs">Contact the school administration for any support or requests.</p>
                </div>
              )}
           </div>

           <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <input 
                value={msgContent} 
                onChange={e => setMsgContent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message to management..." 
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

      {activeTab === 'calendar' && (
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-50 animate-fadeIn">
          <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
            <div className="p-5 bg-teal-50 text-teal-600 rounded-[32px] text-3xl shadow-inner">🗓️</div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Academic & Staff Calendar</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Key School Dates</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             <CalendarTerm title="Current Term" events={[{ date: "Jan 27", label: "Staff In-service" }, { date: "Mar 11", label: "Mid-term Audit" }, { date: "Apr 17", label: "Term Closing", special: true }]} />
             <NoticeCard title="Staff In-service Day" date="Next Monday" content="School closed for learners. All staff to attend development workshop." icon="🧠" color="bg-teal-600" />
             <NoticeCard title="Graduation Planning" date="Ongoing" content="All support staff to verify inventory for the graduation ceremony." icon="🎓" color="bg-rose-600" />
          </div>
        </div>
      )}

      {activeTab === 'handbook' && (
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100 animate-fadeIn space-y-12">
           <div className="max-w-4xl mx-auto space-y-10">
              <section>
                 <h2 className="text-3xl font-black text-indigo-900 mb-6 border-b-4 border-indigo-50 pb-2">Employee Handbook</h2>
                 <p className="text-slate-600 font-medium leading-relaxed mb-4">
                   Netzah International School prides itself on a culture of excellence and biblical values. This portal section contains all relevant policies for our valued staff members.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <PolicyItem title="Code of Conduct" icon="⚖️" />
                    <PolicyItem title="Leave Policy" icon="🏖️" />
                    <PolicyItem title="Health & Benefits" icon="🏥" />
                    <PolicyItem title="Communication Protocol" icon="📞" />
                 </div>
              </section>
           </div>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button onClick={onClick} className={`px-6 py-4 rounded-[24px] font-black text-xs transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const NoticeCard = ({ title, date, content, icon, color }: { title: string, date: string, content: string, icon: string, color: string }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-50 group hover:shadow-2xl hover:-translate-y-1 transition-all">
     <div className="flex justify-between items-start mb-6">
        <div className={`${color} text-white p-4 rounded-3xl shadow-lg transform -rotate-3`}>
           <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</p>
     </div>
     <h4 className="font-black text-slate-800 text-xl mb-3">{title}</h4>
     <p className="text-sm text-slate-500 leading-relaxed">{content}</p>
  </div>
);

const CalendarTerm = ({ title, events }: { title: string, events: any[] }) => (
  <div className="space-y-6">
    <h3 className="font-black text-indigo-900 border-b-4 border-indigo-50 pb-2 text-xl tracking-tighter">{title}</h3>
    <ul className="space-y-4">
      {events.map((e, idx) => (
        <li key={idx} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${e.special ? 'bg-teal-50 text-teal-800 shadow-sm' : 'bg-slate-50/50 hover:bg-slate-50 text-slate-600'}`}>
          <span className="font-black text-[10px] uppercase w-12 text-center bg-white/20 p-2 rounded-xl">{e.date}</span>
          <span className="font-bold text-sm">{e.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PolicyItem = ({ title, icon }: { title: string, icon: string }) => (
  <button className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all w-full text-left group">
     <span className="text-2xl p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">{icon}</span>
     <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{title}</span>
  </button>
);

export default StaffDashboard;
