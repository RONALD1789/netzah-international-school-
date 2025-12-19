
import React, { useState, useEffect, useRef } from 'react';
import { User, Student, ProgressReport, Message, LeaveApplication, Requisition, Book, BorrowedBook } from '../types';
import { CLASS_LABELS, HOUSES, CLASS_SKILL_DATA } from '../constants';
import ReportForm from './ReportForm';
import LeaveApplicationForm from './LeaveApplicationForm';
import RequisitionForm from './RequisitionForm';
import StudentProfile from './StudentProfile';
import OfficialReportView from './OfficialReportView'; // Replaced generic modal
import { draftParentResponse } from '../services/gemini';

interface TeacherDashboardProps {
  user: User;
  students: Student[];
  reports: ProgressReport[];
  messages: Message[];
  leaveApplications: LeaveApplication[];
  requisitions: Requisition[];
  books: Book[];
  borrowings: BorrowedBook[];
  onAddReport: (report: ProgressReport) => void;
  onSendMessage: (message: Message) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
  onApplyLeave: (leave: LeaveApplication) => void;
  onAddRequisition: (req: Requisition) => void;
  onUpdateStudent: (student: Student) => void;
  onAddBorrowing: (borrowing: BorrowedBook) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, students, reports, messages, leaveApplications, requisitions, books, borrowings,
  onAddReport, onSendMessage, onEditMessage, onDeleteMessage, onMarkThreadRead,
  onApplyLeave, onAddRequisition, onUpdateStudent, onAddBorrowing
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'students' | 'attendance' | 'calendar' | 'messages' | 'leave' | 'requisitions' | 'library'>('reports');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewingReport, setViewingReport] = useState<ProgressReport | null>(null);
  const [selectedChatStudent, setSelectedChatStudent] = useState<Student | null>(null);
  const [showManagementThread, setShowManagementThread] = useState(false);
  const [chatContent, setChatContent] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChatStudent, showManagementThread]);

  useEffect(() => {
    if (activeTab === 'messages') {
      if (showManagementThread) {
        onMarkThreadRead(user.id);
      } else if (selectedChatStudent) {
        onMarkThreadRead(selectedChatStudent.id);
      }
    }
  }, [selectedChatStudent, showManagementThread, activeTab, messages.length]);

  const handleSendChat = () => {
    if (!chatContent.trim()) return;
    
    const threadId = showManagementThread ? user.id : (selectedChatStudent?.id || '');
    if (!threadId) return;

    onSendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      threadId: threadId,
      content: chatContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    });
    setChatContent('');
  };

  const handleAIDraft = async () => {
    if (!selectedChatStudent) return;
    
    const threadMsgs = messages.filter(m => m.threadId === selectedChatStudent.id);
    const lastParentMsg = [...threadMsgs].reverse().find(m => m.senderId !== user.id);
    
    if (!lastParentMsg) return;

    setIsDrafting(true);
    const draft = await draftParentResponse(lastParentMsg.content, selectedChatStudent.name, user.name);
    setChatContent(draft);
    setIsDrafting(false);
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
    const activeLoans = borrowings.filter(b => b.borrowerId === user.id && b.status === 'borrowed').length;
    if (activeLoans >= 30) {
      alert("Limit Exceeded: You have 30 active library loans. Please return books before borrowing more.");
      return;
    }

    if (window.confirm(`Confirm borrowing "${book.title}"?`)) {
      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(borrowDate.getDate() + 14); 

      onAddBorrowing({
        id: Math.random().toString(36).substr(2, 9),
        bookId: book.id,
        bookTitle: book.title,
        borrowerId: user.id,
        borrowerName: user.name,
        borrowerRole: 'teacher',
        borrowDate: borrowDate.toLocaleDateString('en-GB'),
        dueDate: dueDate.toLocaleDateString('en-GB'),
        status: 'borrowed',
        fine: 0
      });
    }
  };

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesTerm = termFilter === 'all' || r.term === termFilter;
    return matchesStatus && matchesTerm;
  });

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    b.author.toLowerCase().includes(librarySearch.toLowerCase()) ||
    b.category.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const managementMessages = messages.filter(m => m.threadId === user.id);
  const unreadManagement = managementMessages.filter(m => !m.isRead && m.senderId !== user.id).length;
  const myActiveLoans = borrowings.filter(b => b.borrowerId === user.id && b.status === 'borrowed');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-[32px] shadow-2xl mb-8 border border-slate-50 max-w-[95%] mx-auto overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="📝" label="Reports" />
        <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon="✅" label="Attendance" />
        <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon="💬" label="Communications" />
        <TabButton active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon="📚" label="Library" />
        <TabButton active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} icon="🏖️" label="Leave" />
        <TabButton active={activeTab === 'requisitions'} onClick={() => setActiveTab('requisitions')} icon="📦" label="Requests" />
        <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon="👧" label="Class" />
        <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon="📅" label="Calendar" />
      </div>

      {activeTab === 'library' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-10 rounded-[50px] shadow-xl border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">School Library</h3>
                  <input 
                    placeholder="Search titles, subjects..." 
                    className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none text-sm font-medium w-64 transition-all"
                    value={librarySearch}
                    onChange={e => setLibrarySearch(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 hover:bg-white hover:shadow-lg transition-all group">
                       <div className="w-24 h-32 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-20">📖</span>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{book.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{book.author}</p>
                          <div className="mt-2 space-y-1">
                             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{book.category}</p>
                             <p className="text-[9px] font-bold text-slate-400">Shelf: {book.shelfNumber}</p>
                          </div>
                          <button 
                            disabled={book.availableCopies <= 0}
                            onClick={() => handleBorrow(book)}
                            className={`mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase transition-all ${book.availableCopies > 0 ? 'bg-indigo-900 text-white shadow-md hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
                 <h3 className="text-lg font-black uppercase tracking-widest mb-6">Current Holdings</h3>
                 <div className="space-y-4">
                    {myActiveLoans.map(loan => (
                      <div key={loan.id} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                         <p className="font-black text-sm">{loan.bookTitle}</p>
                         <p className="text-[10px] font-black uppercase text-teal-400 mt-2">Due Date: {loan.dueDate}</p>
                      </div>
                    ))}
                    {myActiveLoans.length === 0 && (
                      <p className="text-center py-10 text-white/30 font-black uppercase text-xs">No active loans</p>
                    )}
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase opacity-60">Status</span>
                    <span className="font-black text-xl">{myActiveLoans.length}/30</span>
                 </div>
              </section>

              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                 <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-4">Library Access</h3>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">Teachers can borrow resources for up to 14 days. Please ensure items are returned in good condition.</p>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase text-center">
                   Librarian: NIS Faculty Head
                 </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-12">
           <LeaveApplicationForm user={user} onSubmit={onApplyLeave} />
           <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-800">My Leave History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {leaveApplications.map(l => (
                   <div key={l.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
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
              <h3 className="text-xl font-black text-slate-800">My Requisition History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {requisitions.map(r => (
                   <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                      <div>
                         <p className="font-black text-slate-700">Requisition #{r.id.toUpperCase()}</p>
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

      {activeTab === 'students' && (
        <div className="animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{user.assignedClass || 'Class Unassigned'}</h2>
              <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mt-1">{CLASS_LABELS[user.assignedClass || ''] || 'Class Registry'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                reports={reports}
                onSelect={() => setSelectedStudent(student)} 
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 flex flex-col md:flex-row h-[700px] overflow-hidden animate-fadeIn">
          <div className="w-full md:w-80 border-r border-slate-50 flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Threads</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class & Staff Direct</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               <button 
                  onClick={() => { setShowManagementThread(true); setSelectedChatStudent(null); }}
                  className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 border-2 ${showManagementThread ? 'bg-teal-600 text-white border-teal-600 shadow-xl' : 'bg-teal-50 border-teal-100 text-teal-900 hover:bg-teal-100'}`}
               >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${showManagementThread ? 'bg-white/20' : 'bg-teal-600 text-white'}`}>🎓</div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                        <p className="font-black text-sm">Headteacher</p>
                        {unreadManagement > 0 && <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadManagement}</span>}
                     </div>
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${showManagementThread ? 'text-white/60' : 'text-teal-600'}`}>Directives</p>
                  </div>
               </button>

               <div className="h-4"></div>
               <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Parent Conversations</p>

               {students.map(s => {
                 const threadMsgs = messages.filter(m => m.threadId === s.id);
                 const lastMsg = threadMsgs[threadMsgs.length - 1];
                 const unreadInThread = threadMsgs.filter(m => !m.isRead && m.senderId !== user.id).length;
                 
                 return (
                   <button 
                    key={s.id}
                    onClick={() => { setSelectedChatStudent(s); setShowManagementThread(false); }}
                    className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 ${selectedChatStudent?.id === s.id ? 'bg-indigo-900 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-600'}`}
                   >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden ${selectedChatStudent?.id === s.id ? 'bg-white/20 ring-2 ring-white' : 'bg-indigo-900 text-white'}`}>
                        {s.profilePhoto ? (
                          <img src={s.profilePhoto} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-xs">{s.firstName[0]}{s.lastName[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center">
                            <p className="font-black text-sm truncate">{s.name}</p>
                            {unreadInThread > 0 && <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadInThread}</span>}
                         </div>
                         <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedChatStudent?.id === s.id ? 'text-white/60' : 'text-slate-400'}`}>
                           {lastMsg ? lastMsg.content : `Parent: ${s.parentName.split(' ')[0]}`}
                         </p>
                      </div>
                   </button>
                 );
               })}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-50/30">
            {(selectedChatStudent || showManagementThread) ? (
              <>
                <div className="p-8 bg-white border-b border-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl ${showManagementThread ? 'bg-teal-600' : 'bg-indigo-900'}`}>
                        {showManagementThread ? '🎓' : '💬'}
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-slate-800 tracking-tight">
                            {showManagementThread ? "Head of School Direct" : `Parent of ${selectedChatStudent?.name}`}
                         </h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {showManagementThread ? "Direct Management Line" : selectedChatStudent?.parentEmail}
                         </p>
                      </div>
                   </div>
                   {!showManagementThread && (
                     <button 
                      onClick={handleAIDraft}
                      disabled={isDrafting}
                      className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-900 px-4 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all"
                     >
                       {isDrafting ? 'Drafting...' : '✨ AI Draft Reply'}
                     </button>
                   )}
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
                   {messages.filter(m => m.threadId === (showManagementThread ? user.id : selectedChatStudent?.id)).map(m => (
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
                                    <p className={`text-[9px] font-black uppercase opacity-60 ${m.senderId === user.id ? 'text-white' : 'text-slate-400'}`}>
                                       {m.senderName} • {m.timestamp}
                                    </p>
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
                    value={chatContent} 
                    onChange={e => setChatContent(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder={showManagementThread ? "Type response to management..." : `Write to ${selectedChatStudent?.parentName.split(' ')[0]}...`}
                    className="flex-1 p-5 bg-slate-50 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm transition-all shadow-inner"
                   />
                   <button 
                    onClick={handleSendChat}
                    className={`${showManagementThread ? 'bg-teal-600' : 'bg-indigo-900'} text-white p-5 rounded-[24px] shadow-xl hover:scale-105 active:scale-95 transition-all`}
                   >
                      <span className="text-xl">🚀</span>
                   </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                 <div className="w-32 h-32 bg-indigo-50 rounded-[50px] flex items-center justify-center text-5xl mb-8 shadow-inner animate-pulse">📩</div>
                 <h4 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Select a thread to communicate</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && <AttendanceTab students={students} />}

      {activeTab === 'reports' && (
        <div className="animate-fadeIn space-y-12">
          <ReportForm user={user} students={students} onSubmit={onAddReport} />
          
          <section className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <h2 className="text-2xl font-black flex items-center gap-4">
                 <span className="p-4 bg-indigo-900 text-white rounded-[24px] shadow-lg text-xl">📋</span> My Class Submissions
               </h2>
               
               <div className="flex flex-wrap items-center gap-3">
                 <div className="relative">
                   <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none p-4 pr-10 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm min-w-[140px]"
                   >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="revision_requested">Revision Requested</option>
                      <option value="approved">Approved</option>
                   </select>
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs">▼</span>
                 </div>

                 <div className="relative">
                   <select 
                    value={termFilter} 
                    onChange={e => setTermFilter(e.target.value)}
                    className="appearance-none p-4 pr-10 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm min-w-[140px]"
                   >
                      <option value="all">All Terms</option>
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                   </select>
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs">▼</span>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredReports.map(report => (
                 <ReportCard key={report.id} report={report} onView={() => setViewingReport(report)} />
               ))}
               {filteredReports.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">No reports matching current filters</p>
                 </div>
               )}
             </div>
          </section>
        </div>
      )}

      {activeTab === 'calendar' && <CalendarView />}

      {selectedStudent && <StudentProfile student={selectedStudent} onUpdateStudent={onUpdateStudent} onClose={() => setSelectedStudent(null)} />}
      {viewingReport && <OfficialReportView report={viewingReport} onClose={() => setViewingReport(null)} />}
    </div>
  );
};

// Sub-components below
const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button onClick={onClick} className={`px-6 py-4 rounded-[24px] font-black text-xs transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const StudentCard = ({ student, reports, onSelect }: { student: Student, reports: ProgressReport[], onSelect: () => void }) => {
  const studentReports = reports.filter(r => r.studentId === student.id);
  const latestReport = studentReports[studentReports.length - 1];
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group cursor-pointer" onClick={onSelect}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden">
          {student.profilePhoto ? <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-indigo-900">{student.firstName[0]}</span>}
        </div>
        <span className="bg-indigo-50 text-indigo-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{student.officialId}</span>
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-1">{student.name}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">House: {student.house}</p>
      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-indigo-600">
          {latestReport ? `Latest: ${latestReport.status}` : 'No Reports'}
        </span>
        <button className="text-indigo-900 font-black text-[9px] uppercase tracking-widest hover:underline">View Profile</button>
      </div>
    </div>
  );
};

const AttendanceTab = ({ students }: { students: Student[] }) => {
  return (
    <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100">
      <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Daily Attendance Registry</h3>
      <div className="space-y-4">
        {students.map(s => (
          <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <p className="font-black text-slate-700">{s.name}</p>
            <div className="flex gap-2">
              <button className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Present</button>
              <button className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Absent</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportCard = ({ report, onView }: { report: ProgressReport, onView: () => void }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-black text-slate-800">{report.learnerName}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.term} • {report.academicYear}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${report.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
        {report.status}
      </span>
    </div>
    <button onClick={onView} className="w-full bg-slate-50 text-indigo-900 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-900 hover:text-white transition-all">View Details</button>
  </div>
);

const CalendarView = () => (
  <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 text-center">
    <div className="text-6xl mb-6">🗓️</div>
    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">School Calendar</h3>
    <p className="text-slate-400 font-medium">Coming soon: Syncing with school events registry.</p>
  </div>
);

export default TeacherDashboard;
