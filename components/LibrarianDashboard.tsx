
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Student, Message, Book, BorrowedBook, PaymentRecord } from '../types';

declare const XLSX: any;

interface LibrarianDashboardProps {
  user: User;
  students: Student[];
  users: User[];
  books: Book[];
  borrowings: BorrowedBook[];
  messages: Message[];
  onAddBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onAddBorrowing: (borrowing: BorrowedBook) => void;
  onReturnBook: (borrowingId: string, condition: 'Good' | 'Damaged' | 'Lost', fine: number) => void;
  onPayFine: (borrowingId: string, amount: number, method: string) => void;
  onSendMessage: (msg: Message) => void;
  onBroadcastMessage: (content: string, sender: User, targetRoles: string[]) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onMarkThreadRead: (threadId: string) => void;
}

const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({
  user, students, users, books, borrowings, messages,
  onAddBook, onEditBook, onDeleteBook, onAddBorrowing, onReturnBook, onPayFine, onSendMessage, onBroadcastMessage, onEditMessage, onDeleteMessage, onMarkThreadRead
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'borrowing' | 'staff' | 'fines' | 'messages'>('overview');
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showIssueBook, setShowIssueBook] = useState(false);
  const [returningItem, setReturningItem] = useState<BorrowedBook | null>(null);
  
  const [fineRate, setFineRate] = useState(500); // UGX per day
  const [damagedFee, setDamagedFee] = useState(5000);
  const [lostFee, setLostFee] = useState(20000);

  const [staffSearch, setStaffSearch] = useState('');
  const [staffClassFilter, setStaffClassFilter] = useState('all');

  const [payingFine, setPayingFine] = useState<BorrowedBook | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<BorrowedBook | null>(null);

  const todayStr = new Date().toLocaleDateString('en-GB');

  const calculateDaysOverdue = (dueDate: string) => {
    const [day, month, year] = dueDate.split('/').map(Number);
    const due = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (now > due) {
      const diffTime = Math.abs(now.getTime() - due.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Metrics
  const totalBooksCount = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const issuedToday = borrowings.filter(b => b.borrowDate === todayStr).length;
  const returnedToday = borrowings.filter(b => b.returnDate === todayStr).length;
  const overdueCount = borrowings.filter(b => b.status === 'borrowed' && calculateDaysOverdue(b.dueDate) > 0).length;
  const totalFinesRecorded = borrowings.reduce((sum, b) => sum + (b.fine || 0), 0);
  const totalFinesPaid = borrowings.reduce((sum, b) => sum + (b.finePaid || 0), 0);
  const activeBorrowers = new Set(borrowings.filter(b => b.status !== 'returned').map(b => b.borrowerId)).size;

  const alerts = useMemo(() => {
    const list: { type: 'overdue' | 'low_stock', msg: string }[] = [];
    borrowings.forEach(b => {
      if (b.status === 'borrowed' && calculateDaysOverdue(b.dueDate) > 0) {
        list.push({ type: 'overdue', msg: `${b.borrowerName} has overdue: ${b.bookTitle}` });
      }
    });
    books.forEach(b => {
      if (b.availableCopies < 2) {
        list.push({ type: 'low_stock', msg: `Low Stock: "${b.title}" only ${b.availableCopies} left` });
      }
    });
    return list;
  }, [borrowings, books]);

  const teachers = useMemo(() => {
    return users.filter(u => u.role === 'teacher' || u.role === 'staff')
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(staffSearch.toLowerCase());
        const matchesClass = staffClassFilter === 'all' || t.assignedClass === staffClassFilter;
        return matchesSearch && matchesClass;
      });
  }, [users, staffSearch, staffClassFilter]);

  const handleReturnAction = (condition: 'Good' | 'Damaged' | 'Lost', fineOverride: number) => {
    if (!returningItem) return;
    onReturnBook(returningItem.id, condition, fineOverride);
    setReturningItem(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Library Resource Total" value={totalBooksCount} icon="📚" color="bg-blue-50 text-blue-900" />
        <MetricCard label="Issued Today" value={issuedToday} icon="📤" color="bg-indigo-50 text-indigo-900" />
        <MetricCard label="Fines Collected (Paid)" value={totalFinesPaid.toLocaleString()} unit="UGX" icon="💰" color="bg-emerald-50 text-emerald-900" />
        <MetricCard label="Active Overdue" value={overdueCount} icon="⚠️" color="bg-rose-50 text-rose-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[32px] shadow-xl border border-slate-50 overflow-x-auto no-scrollbar">
            <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Dashboard" />
            <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon="📖" label="Inventory" />
            <NavBtn active={activeTab === 'borrowing'} onClick={() => setActiveTab('borrowing')} icon="🔄" label="Circulation" />
            <NavBtn active={activeTab === 'fines'} onClick={() => setActiveTab('fines')} icon="💵" label="Fines & Payments" />
            <NavBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon="👩‍🏫" label="Staff Borrowers" />
            <NavBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon="💬" label="Support" />
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-50">
                  <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Active Borrowers</h3>
                  <div className="flex items-center gap-6">
                    <div className="text-5xl">👥</div>
                    <div>
                      <p className="text-4xl font-black text-indigo-900">{activeBorrowers}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Learners/Staff</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Fine Accruals</h3>
                  <div className="flex items-center gap-6">
                    <div className="text-5xl">🏦</div>
                    <div>
                      <p className="text-4xl font-black text-rose-600">{(totalFinesRecorded - totalFinesPaid).toLocaleString()}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending Collection (UGX)</p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Recent Resource Activity</h3>
                <div className="space-y-4">
                  {borrowings.slice(-5).reverse().map(b => (
                    <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="font-black text-slate-700 text-sm">{b.bookTitle}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{b.borrowerName} • {b.status}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${b.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {b.status}
                        </span>
                        {b.fine > 0 && <p className="text-[9px] font-black text-rose-600 mt-1">{b.fine} UGX</p>}
                      </div>
                    </div>
                  ))}
                  {borrowings.length === 0 && <p className="text-center py-10 text-slate-300 font-bold uppercase text-xs">No records found</p>}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Library Catalog</h3>
                <div className="flex gap-2">
                   <button onClick={() => setShowAddBook(true)} className="bg-indigo-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all">+ Add Resource</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {books.map(b => (
                  <BookListItem key={b.id} book={b} onEdit={() => setEditingBook(b)} onDelete={() => onDeleteBook(b.id)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'borrowing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Circulation Log</h3>
                <button onClick={() => setShowIssueBook(true)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  <span>📤</span> Issue Book
                </button>
              </div>
              <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Borrower</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Resource</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-center">Timeline</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-center">Status</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {borrowings.slice().reverse().map(br => (
                      <BorrowingRow key={br.id} br={br} onReturn={() => setReturningItem(br)} calculateOverdue={calculateDaysOverdue} fineRate={fineRate} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fines' && (
            <div className="space-y-8 animate-fadeIn">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                     <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Fine Rules & Setup</h3>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Late Fee (Per Day)</label>
                           <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-900" value={fineRate} onChange={e => setFineRate(parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Damaged Flat Fee</label>
                              <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-900" value={damagedFee} onChange={e => setDamagedFee(parseInt(e.target.value) || 0)} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Lost Flat Fee</label>
                              <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-900" value={lostFee} onChange={e => setLostFee(parseInt(e.target.value) || 0)} />
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="bg-indigo-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Daily Revenue</h3>
                        <p className="text-5xl font-black">{totalFinesPaid.toLocaleString()} <span className="text-xs opacity-60">UGX</span></p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-4">Synced with Accountant records</p>
                     </div>
                     <div className="absolute right-0 bottom-0 opacity-10 text-9xl transform translate-x-1/4 translate-y-1/4">📉</div>
                  </section>
               </div>

               <section className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Outstanding Fines Queue</h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50">
                           <tr>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Borrower</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Description</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Total Fine</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Balance</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Payment Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {borrowings.filter(b => (b.fine || 0) > (b.finePaid || 0)).map(b => (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                 <td className="px-8 py-5 font-black text-slate-800">{b.borrowerName}</td>
                                 <td className="px-8 py-5 text-xs text-slate-500 font-bold">{b.bookTitle} ({b.returnCondition || 'Overdue'})</td>
                                 <td className="px-8 py-5 font-black text-indigo-900">{b.fine.toLocaleString()}</td>
                                 <td className="px-8 py-5 font-black text-rose-600">{(b.fine - (b.finePaid || 0)).toLocaleString()}</td>
                                 <td className="px-8 py-5 text-right">
                                    <button onClick={() => setPayingFine(b)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all">Collect Pay</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  {borrowings.filter(b => (b.fine || 0) > (b.finePaid || 0)).length === 0 && (
                     <div className="py-20 text-center text-slate-200 font-black uppercase tracking-widest text-xs italic">Registry is clear of outstanding debts.</div>
                  )}
               </section>

               <section className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Payment History</h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50">
                           <tr>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Recipient</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Book</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Amount Paid</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">View Receipt</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {borrowings.filter(b => (b.finePaid || 0) > 0).map(b => (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                 <td className="px-8 py-5 font-black text-slate-800">{b.borrowerName}</td>
                                 <td className="px-8 py-5 text-xs text-slate-500 font-bold">{b.bookTitle}</td>
                                 <td className="px-8 py-5 font-black text-emerald-600">{(b.finePaid || 0).toLocaleString()} UGX</td>
                                 <td className="px-8 py-5 text-right">
                                    <button onClick={() => setViewingReceipt(b)} className="text-indigo-900 font-black text-[9px] uppercase tracking-widest hover:underline decoration-2">Official Receipt</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <input 
                    placeholder="Search staff by name..." 
                    className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                  />
                  <select 
                    className="p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                    value={staffClassFilter}
                    onChange={e => setStaffClassFilter(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    <option value="Sweet Pea">Sweet Pea</option>
                    <option value="Sunbeams">Sunbeams</option>
                    <option value="Spectrum">Spectrum</option>
                    <option value="Shammah">Shammah</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {teachers.map(t => {
                    const staffHistory = borrowings.filter(b => b.borrowerId === t.id);
                    const staffActive = staffHistory.filter(b => b.status === 'borrowed').length;
                    const staffOverdue = staffHistory.filter(b => b.status === 'borrowed' && calculateDaysOverdue(b.dueDate) > 0).length;

                    return (
                      <div key={t.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-900 text-white rounded-2xl flex items-center justify-center text-xl font-black">
                            {t.name[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800">{t.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role.toUpperCase()} • {t.assignedClass || 'Support Staff'}</p>
                          </div>
                        </div>
                        <div className="flex gap-10">
                           <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Active Loans</p>
                              <p className={`text-lg font-black ${staffActive >= 30 ? 'text-rose-600' : 'text-indigo-900'}`}>{staffActive}/30</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Overdue</p>
                              <p className={`text-lg font-black ${staffOverdue > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{staffOverdue}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => { setActiveTab('borrowing'); }} 
                          className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          View History
                        </button>
                      </div>
                    );
                  })}
                  {teachers.length === 0 && <p className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No staff found matching criteria</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <LibraryMessages 
              user={user} 
              messages={messages} 
              onSendMessage={onSendMessage} 
              onBroadcastMessage={onBroadcastMessage} 
              onEditMessage={onEditMessage} 
              onDeleteMessage={onDeleteMessage} 
            />
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🚨</span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Library Alerts</h3>
            </div>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((a, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border-l-4 shadow-sm flex items-start gap-3 animate-pulse-slow ${a.type === 'overdue' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-amber-50 border-amber-500 text-amber-900'}`}>
                  <span className="mt-0.5">{a.type === 'overdue' ? '⏳' : '📦'}</span>
                  <p className="text-[11px] font-bold leading-relaxed">{a.msg}</p>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No active alerts</div>
              )}
            </div>
          </section>

          <section className="bg-indigo-900 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 tracking-tighter">System Rules</h3>
                <ul className="space-y-4 text-xs font-medium opacity-80 leading-relaxed">
                   <li className="flex gap-3"><span>📌</span> <strong>Limit:</strong> Staff: 30 books, Students: 5 books.</li>
                   <li className="flex gap-3"><span>📌</span> <strong>Blocks:</strong> Automated block if overdue items exist.</li>
                   <li className="flex gap-3"><span>📌</span> <strong>Fines:</strong> Set at {fineRate} UGX per day. Manual waivers allowed.</li>
                </ul>
             </div>
             <div className="absolute -bottom-10 -right-10 text-8xl opacity-10">🛡️</div>
          </section>
        </div>
      </div>

      {(showAddBook || editingBook) && (
        <AddEditBookModal book={editingBook} onClose={() => { setShowAddBook(false); setEditingBook(null); }} onSubmit={(b) => { if (editingBook) onEditBook(b); else onAddBook(b); setShowAddBook(false); setEditingBook(null); }} />
      )}
      
      {showIssueBook && (
        <IssueBookModal 
          books={books.filter(b => b.availableCopies > 0)} 
          students={students} 
          users={users} 
          borrowings={borrowings}
          calculateOverdue={calculateDaysOverdue}
          onClose={() => setShowIssueBook(false)} 
          onSubmit={(br) => { onAddBorrowing(br); setShowIssueBook(false); }} 
        />
      )}

      {returningItem && (
        <ReturnBookModal 
          item={returningItem} 
          onClose={() => setReturningItem(null)} 
          onSubmit={handleReturnAction} 
          calculateOverdue={calculateDaysOverdue}
          fineRate={fineRate}
          damagedFee={damagedFee}
          lostFee={lostFee}
        />
      )}

      {payingFine && (
        <PayFineModal 
          item={payingFine} 
          onClose={() => setPayingFine(null)} 
          onSubmit={(amount: number, method: string) => { 
            onPayFine(payingFine.id, amount, method); 
            setPayingFine(null); 
          }} 
        />
      )}

      {viewingReceipt && (
        <FineReceiptModal 
          item={viewingReceipt} 
          onClose={() => setViewingReceipt(null)} 
        />
      )}
    </div>
  );
};

const BookListItem = ({ book, onEdit, onDelete }: { book: Book, onEdit: () => void, onDelete: () => void }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-50 flex flex-col md:flex-row gap-6 group hover:border-indigo-200 transition-all">
    <div className="w-full md:w-32 h-48 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-50 relative">
      {book.coverImage ? (
        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="text-center opacity-20">
          <p className="text-4xl">📖</p>
          <p className="text-[8px] font-black uppercase mt-2">No Cover</p>
        </div>
      )}
    </div>
    <div className="flex-1 space-y-3">
      <div className="flex justify-between items-start">
        <div>
           <h4 className="font-black text-slate-800 text-lg leading-tight">{book.title}</h4>
           <p className="text-sm text-slate-500 font-bold">{book.author}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={onEdit} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">✏️</button>
           <button onClick={() => { if(window.confirm('Delete this record?')) onDelete(); }} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all">🗑️</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
         <Detail label="ISBN" value={book.isbn} />
         <Detail label="Shelf" value={book.shelfNumber} />
         <Detail label="Publisher" value={`${book.publisher} (${book.publishedYear})`} />
         <Detail label="Target" value={book.ageGroup} />
      </div>
      <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
           <StatusBadge label={book.category} color="bg-indigo-50 text-indigo-900" />
           <StatusBadge label={book.condition} color={book.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} />
        </div>
        <div className="flex gap-6">
           <CountInfo label="Available" value={`${book.availableCopies}/${book.totalCopies}`} color="text-emerald-600" />
           <CountInfo label="Issued" value={String(book.totalCopies - book.availableCopies)} color="text-indigo-900" />
        </div>
      </div>
    </div>
  </div>
);

const Detail = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="font-bold text-slate-700 truncate">{value}</p>
  </div>
);

const StatusBadge = ({ label, color }: { label: string, color: string }) => (
  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${color}`}>{label}</span>
);

const CountInfo = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="text-right">
    <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
    <p className={`text-sm font-black ${color}`}>{value}</p>
  </div>
);

const BorrowingRow = ({ br, onReturn, calculateOverdue, fineRate }: any) => {
  const overdueDays = br.status === 'borrowed' ? calculateOverdue(br.dueDate) : 0;
  const estFine = overdueDays * fineRate;
  
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <p className="font-bold text-slate-800">{br.borrowerName}</p>
        <p className="text-[9px] text-slate-400 uppercase font-black">{br.borrowerRole}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-bold text-slate-700">{br.bookTitle}</p>
      </td>
      <td className="px-6 py-4 text-center">
        <p className="font-black text-slate-400 text-[9px] uppercase">Issued: {br.borrowDate}</p>
        <p className={`font-black ${overdueDays > 0 ? 'text-rose-600' : 'text-indigo-900'} text-[10px]`}>Due: {br.dueDate}</p>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${br.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : overdueDays > 0 ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
          {overdueDays > 0 ? `Overdue (${overdueDays}d)` : br.status}
        </span>
        {estFine > 0 && br.status === 'borrowed' && <p className="text-[9px] font-black text-rose-600 mt-1 italic">Fine: {estFine} UGX</p>}
      </td>
      <td className="px-6 py-4 text-right">
        {br.status === 'borrowed' ? (
          <button onClick={onReturn} className="bg-indigo-50 text-indigo-900 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase hover:bg-indigo-900 hover:text-white transition-all shadow-sm">Mark Return</button>
        ) : (
          <div className="text-right">
             <p className="text-[9px] font-black text-emerald-600 uppercase">Returned</p>
             {br.fine > 0 && <p className="text-[8px] font-bold text-slate-400 italic">Fine Recorded: {br.fine} UGX</p>}
          </div>
        )}
      </td>
    </tr>
  );
};

const ReturnBookModal = ({ item, onClose, onSubmit, calculateOverdue, fineRate, damagedFee, lostFee }: any) => {
  const [condition, setCondition] = useState<'Good' | 'Damaged' | 'Lost'>('Good');
  const overdueDays = calculateOverdue(item.dueDate);
  const baseOverdueFine = overdueDays * fineRate;
  
  const initialTotal = useMemo(() => {
    let f = baseOverdueFine;
    if (condition === 'Damaged') f += damagedFee;
    if (condition === 'Lost') f += lostFee;
    return f;
  }, [baseOverdueFine, condition, damagedFee, lostFee]);

  const [finalFine, setFinalFine] = useState(initialTotal);

  useEffect(() => {
    setFinalFine(initialTotal);
  }, [initialTotal]);

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Process Return</h3>
        <p className="text-sm font-bold text-slate-500 mb-6">Returning "{item.bookTitle}" from <span className="text-indigo-900">{item.borrowerName}</span></p>
        
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">Return Condition</label>
              <div className="grid grid-cols-3 gap-2">
                 {(['Good', 'Damaged', 'Lost'] as const).map(c => (
                   <button 
                    key={c} 
                    onClick={() => setCondition(c)}
                    className={`p-3 rounded-2xl text-[9px] font-black uppercase transition-all ${condition === c ? 'bg-indigo-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                   >
                     {c}
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Overdue Fine ({overdueDays} days)</span>
                 <span>{baseOverdueFine.toLocaleString()} UGX</span>
              </div>
              {condition !== 'Good' && (
                <div className="flex justify-between text-xs font-bold text-rose-600">
                   <span>{condition} Penalty</span>
                   <span>{condition === 'Damaged' ? damagedFee.toLocaleString() : lostFee.toLocaleString()} UGX</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Fine Adjustment (UGX)</label>
                 <input 
                  type="number" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-indigo-900" 
                  value={finalFine} 
                  onChange={e => setFinalFine(parseInt(e.target.value) || 0)} 
                 />
              </div>
           </div>
        </div>

        <div className="flex gap-4 mt-8">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Cancel</button>
           <button onClick={() => onSubmit(condition, finalFine)} className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Confirm Return</button>
        </div>
      </div>
    </div>
  );
};

const PayFineModal = ({ item, onClose, onSubmit }: any) => {
  const balance = item.fine - (item.finePaid || 0);
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState('Cash');

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Fine Payment</h3>
        <div className="space-y-6">
           <div className="p-5 bg-indigo-50 rounded-2xl">
              <p className="text-[10px] font-black text-indigo-400 uppercase">Remaining Balance</p>
              <p className="text-3xl font-black text-indigo-900">{balance.toLocaleString()} UGX</p>
           </div>
           
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Amount to Pay (UGX)</label>
              <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Method</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={method} onChange={e => setMethod(e.target.value)}>
                 <option>Cash</option>
                 <option>Mobile Money</option>
                 <option>Bank Transfer</option>
              </select>
           </div>
        </div>

        <div className="flex gap-4 mt-8">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Cancel</button>
           <button onClick={() => onSubmit(amount, method)} className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Record Payment</button>
        </div>
      </div>
    </div>
  );
};

const FineReceiptModal = ({ item, onClose }: any) => (
  <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 animate-scaleIn relative overflow-hidden">
       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16"></div>
       <div className="relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Library Receipt</h3>
          <div className="h-px w-full bg-slate-100"></div>
          
          <div className="space-y-4 text-left">
             <ReceiptItem label="Receipt No" value={`NISC-LIB-${item.id.toUpperCase()}`} />
             <ReceiptItem label="Borrower" value={item.borrowerName} />
             <ReceiptItem label="Resource" value={item.bookTitle} />
             <ReceiptItem label="Condition" value={item.returnCondition || 'Normal Return'} />
             <ReceiptItem label="Amount Paid" value={`${(item.finePaid || 0).toLocaleString()} UGX`} highlight />
             <ReceiptItem label="Balance" value={`${(item.fine - (item.finePaid || 0)).toLocaleString()} UGX`} />
          </div>

          <div className="pt-6">
             <button onClick={() => window.print()} className="w-full bg-indigo-900 text-white font-black py-4 rounded-3xl shadow-lg uppercase text-xs mb-4">Print Official Receipt</button>
             <button onClick={onClose} className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Close Preview</button>
          </div>
          
          <p className="text-[8px] font-bold text-slate-300 uppercase mt-4">Thank you for supporting Netzah Library</p>
       </div>
    </div>
  </div>
);

const ReceiptItem = ({ label, value, highlight }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <span className={`text-xs font-bold ${highlight ? 'text-emerald-600 font-black' : 'text-slate-700'}`}>{value}</span>
  </div>
);

const IssueBookModal = ({ books, students, users, borrowings, calculateOverdue, onClose, onSubmit }: any) => {
  const [bookId, setBookId] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [days, setDays] = useState(7);
  const [isScanning, setIsScanning] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  
  const staffs = users.filter(u => u.role === 'teacher' || u.role === 'staff');

  useEffect(() => {
    if (!borrowerId) { setBlockReason(null); return; }

    const borrowerHistory = borrowings.filter((b: any) => b.borrowerId === borrowerId);
    const activeCount = borrowerHistory.filter((b: any) => b.status === 'borrowed').length;
    const overdueCount = borrowerHistory.filter((b: any) => b.status === 'borrowed' && calculateOverdue(b.dueDate) > 0).length;
    
    const isTeacher = staffs.some(s => s.id === borrowerId);
    const limit = 30; // Unified staff limit

    if (overdueCount > 0) {
      setBlockReason(`BLOCK: Borrower has ${overdueCount} overdue item(s). Return them before borrowing more.`);
    } else if (activeCount >= limit) {
      setBlockReason(`BLOCK: Borrowing limit reached (${activeCount}/${limit}).`);
    } else {
      setBlockReason(null);
    }
  }, [borrowerId, borrowings, calculateOverdue]);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      if (books.length > 0) {
        const randomBook = books[Math.floor(Math.random() * books.length)];
        setBookId(randomBook.id);
      }
      setIsScanning(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">Issue Resource</h3>
          <button onClick={simulateScan} disabled={isScanning} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isScanning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {isScanning ? '⌛ Scanning...' : '📷 Scan'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Resource</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={bookId} onChange={e => setBookId(e.target.value)}>
               <option value="">Select a book...</option>
               {books.map((b: any) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} left)</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Borrower</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={borrowerId} onChange={e => setBorrowerId(e.target.value)}>
               <option value="">Select user...</option>
               <optgroup label="Learners">
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
               </optgroup>
               <optgroup label="Faculty">
                  {staffs.map((st: any) => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
               </optgroup>
            </select>
          </div>

          {blockReason && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-[10px] font-black uppercase text-center leading-relaxed">
              ⚠️ {blockReason}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Loan Days</label>
            <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Cancel</button>
           <button 
             disabled={!!blockReason || !bookId || !borrowerId}
             onClick={() => {
                const book = books.find((b: any) => b.id === bookId);
                const borrower = [...students, ...staffs].find((x: any) => x.id === borrowerId);
                const borrowDate = new Date();
                const dueDate = new Date();
                dueDate.setDate(borrowDate.getDate() + days);
                onSubmit({
                  id: Math.random().toString(36).substr(2, 9),
                  bookId, bookTitle: book.title, borrowerId, borrowerName: borrower.name,
                  borrowerRole: 'role' in borrower ? borrower.role : 'student',
                  borrowDate: borrowDate.toLocaleDateString('en-GB'),
                  dueDate: dueDate.toLocaleDateString('en-GB'),
                  status: 'borrowed', fine: 0
                });
             }} className="flex-[2] bg-emerald-600 disabled:bg-slate-200 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Confirm Issue</button>
        </div>
      </div>
    </div>
  );
};

const AddEditBookModal = ({ book, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState<Partial<Book>>({ title: '', author: '', isbn: '', category: 'Storybook', ageGroup: 'All', publisher: '', publishedYear: '', shelfNumber: '', totalCopies: 1, condition: 'New' });
  useEffect(() => { if (book) setFormData(book); }, [book]);
  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, coverImage: reader.result as string }); reader.readAsDataURL(file); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 md:p-12 animate-scaleIn my-8">
        <h3 className="text-3xl font-black text-indigo-900 uppercase tracking-tighter mb-8">{book ? 'Edit Resource' : 'New Catalog Entry'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div onClick={() => document.getElementById('cov-up')?.click()} className="aspect-[3/4] bg-slate-50 rounded-3xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 overflow-hidden relative">
             {formData.coverImage ? <img src={formData.coverImage} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-20">📸</span>}
             <input id="cov-up" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div className="md:col-span-2 space-y-4">
             <input placeholder="Title" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <input placeholder="Author" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <input placeholder="ISBN" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                <input placeholder="Shelf" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.shelfNumber} onChange={e => setFormData({...formData, shelfNumber: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <input placeholder="Publisher" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                <input placeholder="Year" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.publishedYear} onChange={e => setFormData({...formData, publishedYear: e.target.value})} />
             </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Storybook</option><option>Reference</option><option>Math & Science</option><option>Religious</option>
           </select>
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})}>
              <option>All Ages</option><option>Baby Class</option><option>Pre-K</option><option>Primary</option>
           </select>
           <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-center" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value) || 1})} />
        </div>
        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Discard</button>
           <button onClick={() => onSubmit({ ...formData, id: book?.id || Math.random().toString(36).substr(2, 9), availableCopies: formData.totalCopies } as Book)} className="flex-[2] bg-indigo-900 text-white font-black py-4 rounded-3xl uppercase text-xs shadow-xl">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const LibraryMessages = ({ user, messages, onSendMessage, onBroadcastMessage, onEditMessage, onDeleteMessage }: any) => {
  const [msgContent, setMsgContent] = useState('');
  const [msgTarget, setMsgTarget] = useState<'management' | 'staff_all' | 'teachers'>('management');
  
  const handleSend = () => { 
    if (!msgContent.trim()) return; 
    if (msgTarget === 'teachers') {
      onBroadcastMessage(msgContent, user, ['teacher']);
      alert("Broadcast sent to all teachers!");
    } else if (msgTarget === 'staff_all') {
      onBroadcastMessage(msgContent, user, ['teacher', 'staff']);
      alert("Broadcast sent to all staff members!");
    } else {
      onSendMessage({ 
        id: Math.random().toString(36).substr(2, 9), 
        senderId: user.id, 
        senderName: user.name, 
        threadId: user.id, 
        content: msgContent, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isRead: false 
      }); 
    }
    setMsgContent(''); 
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col h-[600px] overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h4 className="font-black text-slate-800 uppercase text-xs">Communication Hub</h4>
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
           <button 
             onClick={() => setMsgTarget('management')}
             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${msgTarget === 'management' ? 'bg-indigo-900 text-white' : 'text-slate-400'}`}
           >Support</button>
           <button 
             onClick={() => setMsgTarget('teachers')}
             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${msgTarget === 'teachers' ? 'bg-indigo-900 text-white' : 'text-slate-400'}`}
           >Teachers</button>
           <button 
             onClick={() => setMsgTarget('staff_all')}
             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${msgTarget === 'staff_all' ? 'bg-indigo-900 text-white' : 'text-slate-400'}`}
           >All Staff</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
         {msgTarget === 'management' ? (
           messages.filter((m: any) => m.threadId === user.id).map((m: any) => (
             <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.senderId === user.id ? 'bg-indigo-900 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none shadow-sm'}`}>
                  {m.content}<p className="text-[8px] font-black uppercase mt-1 opacity-50">{m.timestamp}</p>
                </div>
             </div>
           ))
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-40">
             <span className="text-5xl">📢</span>
             <p className="font-black text-xs uppercase tracking-widest leading-relaxed">
               Broadcast messages will be sent to the communication threads of {msgTarget === 'teachers' ? 'all teachers' : 'all faculty & support staff'}.
             </p>
           </div>
         )}
      </div>

      <div className="p-6 bg-white border-t border-slate-50 space-y-4">
         {msgTarget !== 'management' && (
           <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-[9px] font-black text-amber-700 uppercase">Attention: Sending this will message {msgTarget === 'teachers' ? 'every teacher' : 'the entire school staff'}.</p>
           </div>
         )}
         <div className="flex gap-3">
           <input 
             value={msgContent} 
             onChange={e => setMsgContent(e.target.value)} 
             placeholder={msgTarget === 'management' ? "Type message to management..." : `Type broadcast to ${msgTarget === 'teachers' ? 'teachers' : 'all staff'}...`}
             className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" 
           />
           <button 
             onClick={handleSend} 
             className={`${msgTarget !== 'management' ? 'bg-amber-500' : 'bg-indigo-900'} text-white px-6 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all`}
           >
             {msgTarget !== 'management' ? '📢' : '🚀'}
           </button>
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, icon, color }: { label: string, value: string | number, unit?: string, icon: string, color: string }) => (
  <div className={`${color} p-8 rounded-[40px] shadow-xl border-2 border-white group hover:scale-105 transition-all`}>
     <div className="flex justify-between items-center mb-4">
        <span className="text-3xl">{icon}</span>
        <div className="text-right">
           <span className="text-4xl font-black tracking-tighter leading-none">{value}</span>
           {unit && <p className="text-[10px] font-black uppercase opacity-60">{unit}</p>}
        </div>
     </div>
     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
  </div>
);

const NavBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

export default LibrarianDashboard;
