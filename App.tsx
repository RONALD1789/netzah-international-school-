
import React, { useState, useEffect } from 'react';
import { User, Student, ProgressReport, Invoice, ExpenseRecord, PaymentRecord, Message, LeaveApplication, Requisition, Book, BorrowedBook, AuditLog, SystemSettings, PayrollRecord, BudgetRecord, BankTransaction } from './types';
import { END_OF_TERM_LETTER } from './constants';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ParentDashboard from './components/ParentDashboard';
import HeadteacherDashboard from './components/HeadteacherDashboard';
import AccountantDashboard from './components/AccountantDashboard';
import StaffDashboard from './components/StaffDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import Navbar from './components/Navbar';

const DEFAULT_SETTINGS: SystemSettings = {
  branding: {
    schoolName: "Netzah International School",
    motto: "Nurturing & Training for Victory",
    logoUrl: "https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290",
    primaryColor: "#1B3A5F",
    secondaryColor: "#2DD4BF"
  },
  security: {
    sessionTimeout: 30,
    requireTwoFactor: false,
    passwordComplexity: 'medium',
    maintenanceMode: false
  },
  activeSchoolId: "NIS-01",
  schools: [
    { id: "NIS-01", name: "Netzah International School", campus: "Main Campus", address: "P.O. Box 72441, Kampala", contact: "+256 700 000 000" }
  ],
  timezone: "Africa/Kampala",
  currency: "UGX"
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowedBook[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  
  // Financial specifics
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);

  // Initialize data from local storage
  useEffect(() => {
    const safeParse = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        if (!item || item === "null" || item === "undefined") return fallback;
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) return parsed.filter(i => i !== null);
        return parsed || fallback;
      } catch (e) {
        console.error(`Failed to parse ${key}`, e);
        return fallback;
      }
    };

    setReports(safeParse('netzah_reports', []));
    setStudents(safeParse('netzah_students', []));
    setInvoices(safeParse('netzah_invoices', []));
    setExpenses(safeParse('netzah_expenses', []));
    setPayments(safeParse('netzah_payments', []));
    setMessages(safeParse('netzah_messages', []));
    setUsers(safeParse('netzah_users', []));
    setUser(safeParse('netzah_user', null));
    setLeaveApplications(safeParse('netzah_leave', []));
    setRequisitions(safeParse('netzah_requisitions', []));
    setBooks(safeParse('netzah_books', []));
    setBorrowings(safeParse('netzah_borrowings', []));
    setAuditLogs(safeParse('netzah_audit', []));
    setSettings(safeParse('netzah_settings', DEFAULT_SETTINGS));
    setPayroll(safeParse('netzah_payroll', []));
    setBudgets(safeParse('netzah_budgets', []));
    setBankTransactions(safeParse('netzah_bank', []));
  }, []);

  useEffect(() => {
    localStorage.setItem('netzah_reports', JSON.stringify(reports));
    localStorage.setItem('netzah_students', JSON.stringify(students));
    localStorage.setItem('netzah_users', JSON.stringify(users));
    localStorage.setItem('netzah_leave', JSON.stringify(leaveApplications));
    localStorage.setItem('netzah_requisitions', JSON.stringify(requisitions));
    localStorage.setItem('netzah_invoices', JSON.stringify(invoices));
    localStorage.setItem('netzah_expenses', JSON.stringify(expenses));
    localStorage.setItem('netzah_payments', JSON.stringify(payments));
    localStorage.setItem('netzah_messages', JSON.stringify(messages));
    localStorage.setItem('netzah_books', JSON.stringify(books));
    localStorage.setItem('netzah_borrowings', JSON.stringify(borrowings));
    localStorage.setItem('netzah_audit', JSON.stringify(auditLogs));
    localStorage.setItem('netzah_settings', JSON.stringify(settings));
    localStorage.setItem('netzah_payroll', JSON.stringify(payroll));
    localStorage.setItem('netzah_budgets', JSON.stringify(budgets));
    localStorage.setItem('netzah_bank', JSON.stringify(bankTransactions));
  }, [reports, students, users, invoices, expenses, payments, messages, leaveApplications, requisitions, books, borrowings, auditLogs, settings, payroll, budgets, bankTransactions]);

  const addAuditLog = (action: string, details: string, category: AuditLog['category']) => {
    if (!user) return;
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('en-GB'),
      userId: user.id,
      userName: user.name,
      action,
      details,
      category
    };
    setAuditLogs(prev => [log, ...prev].slice(0, 1000));
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    if (!newSettings) return;
    setSettings(newSettings);
    addAuditLog('Update System Settings', 'Modified global branding or security parameters', 'System');
  };

  const handleLogin = (userData: User) => {
    if (!userData) return;
    setUser(userData);
    localStorage.setItem('netzah_user', JSON.stringify(userData));
    setUsers(prev => {
      const exists = prev.find(u => u && u.email === userData.email);
      if (exists) return prev;
      return [...prev, userData];
    });
    addAuditLog('User Login', `Session started for ${userData.name}`, 'Administrative');
  };

  const handleLogout = () => {
    addAuditLog('User Logout', `User ${user?.name} logged out.`, 'Administrative');
    setUser(null);
    localStorage.removeItem('netzah_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (!updatedUser) return;
    setUsers(prev => prev.map(u => u && u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
      localStorage.setItem('netzah_user', JSON.stringify(updatedUser));
    }
    addAuditLog('Update User', `Modified access for ${updatedUser.name} (${updatedUser.role})`, 'Administrative');
  };

  const handleBackup = () => {
    const data = {
      reports, students, users, leaveApplications, requisitions, 
      invoices, expenses, payments, messages, books, borrowings, auditLogs, settings, payroll, budgets, bankTransactions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NETZAH_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addAuditLog('System Backup', 'Full database export initiated by administrator', 'System');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.students) setStudents(data.students.filter((i: any) => i !== null));
        if (data.reports) setReports(data.reports.filter((i: any) => i !== null));
        if (data.users) setUsers(data.users.filter((i: any) => i !== null));
        if (data.leaveApplications) setLeaveApplications(data.leaveApplications.filter((i: any) => i !== null));
        if (data.requisitions) setRequisitions(data.requisitions.filter((i: any) => i !== null));
        if (data.invoices) setInvoices(data.invoices.filter((i: any) => i !== null));
        if (data.expenses) setExpenses(data.expenses.filter((i: any) => i !== null));
        if (data.payments) setPayments(data.payments.filter((i: any) => i !== null));
        if (data.messages) setMessages(data.messages.filter((i: any) => i !== null));
        if (data.books) setBooks(data.books.filter((i: any) => i !== null));
        if (data.borrowings) setBorrowings(data.borrowings.filter((i: any) => i !== null));
        if (data.auditLogs) setAuditLogs(data.auditLogs.filter((i: any) => i !== null));
        if (data.settings) setSettings(data.settings);
        if (data.payroll) setPayroll(data.payroll.filter((i: any) => i !== null));
        if (data.budgets) setBudgets(data.budgets.filter((i: any) => i !== null));
        if (data.bankTransactions) setBankTransactions(data.bankTransactions.filter((i: any) => i !== null));
        alert("Database restored successfully!");
        addAuditLog('System Restore', 'Database state overwritten via backup import', 'System');
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected', remarks: string) => {
    setLeaveApplications(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, status, [user?.role === 'admin' ? 'adminRemarks' : 'headRemarks']: remarks } : l);
      const application = updated.find(l => l.id === id);
      if (application) {
        addAuditLog('Leave Status Update', `${status.toUpperCase()} leave for ${application.userName}`, 'Administrative');
        const systemMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: 'SYSTEM_OFFICE',
          senderName: 'School Administration',
          threadId: application.userId,
          content: `Leave Update: Your ${application.type} leave has been ${status.toUpperCase()}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        };
        setMessages(prevMsgs => [...prevMsgs, systemMessage]);
      }
      return updated;
    });
  };

  const updateRequisitionStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    addAuditLog('Requisition Status', `${status.toUpperCase()} request ID: ${id}`, 'Financial');
  };

  const updateReport = (updatedReport: ProgressReport) => {
    if (user?.role !== 'admin' && user?.role !== 'headteacher') return;
    const oldReport = reports.find(r => r.id === updatedReport.id);
    const isNowApproved = oldReport?.status !== 'approved' && updatedReport.status === 'approved';
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    if (isNowApproved) {
      addAuditLog('Report Approved', `Official release for ${updatedReport.learnerName}`, 'Academic');
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        senderId: 'SYSTEM_OFFICE',
        senderName: 'School Administration',
        threadId: updatedReport.studentId,
        content: `Your progress report is now available.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      }]);
    }
  };

  const markThreadAsRead = (tid: string) => {
    if (!user) return;
    setMessages(prev => prev.map(m => m.threadId === tid && m.senderId !== user.id && !m.isRead ? { ...m, isRead: true, readAt: new Date().toLocaleTimeString() } : m));
  };

  if (!user) {
    return <Login onLogin={handleLogin} branding={settings?.branding || DEFAULT_SETTINGS.branding} users={users} />;
  }

  const filteredMessages = messages.filter(m => m !== null).filter(m => {
    if (user.role === 'parent') return m.threadId === user.studentId;
    if (user.role === 'teacher' || user.role === 'staff' || user.role === 'librarian') {
      const assignedStudents = students.filter(s => s && s.className === user.assignedClass).map(s => s.id);
      return assignedStudents.includes(m.threadId) || m.threadId === user.id;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        messages={filteredMessages} 
        branding={settings?.branding || DEFAULT_SETTINGS.branding}
        onMarkAllRead={() => {
          if (user?.role === 'parent' && user.studentId) markThreadAsRead(user.studentId);
          if (user && (user.role === 'teacher' || user.role === 'staff' || user.role === 'librarian')) markThreadAsRead(user.id);
        }}
      />
      <main className="container mx-auto px-4 mt-8 max-w-6xl">
        {user.role === 'teacher' && (
          <TeacherDashboard user={user} students={students.filter(s => s && s.className === user.assignedClass && !s.isGraduated)} reports={reports.filter(r => r && r.teacherId === user.id)} messages={filteredMessages} leaveApplications={leaveApplications.filter(l => l && l.userId === user.id)} requisitions={requisitions.filter(r => r && r.userId === user.id)} books={books} borrowings={borrowings} onAddReport={(r) => { setReports(prev => [...prev, r]); addAuditLog('Report Submit', `Report for ${r.learnerName}`, 'Academic'); }} onSendMessage={(m) => setMessages(prev => [...prev, m])} onEditMessage={(id, c) => setMessages(prev => prev.map(m => m.id === id ? {...m, content: c} : m))} onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))} onMarkThreadRead={markThreadAsRead} onApplyLeave={(l) => { setLeaveApplications(prev => [l, ...prev]); addAuditLog('Leave Apply', `Type: ${l.type}`, 'Administrative'); }} onAddRequisition={(r) => { setRequisitions(prev => [r, ...prev]); addAuditLog('Requisition Submit', `Amt: ${r.totalAmount}`, 'Financial'); }} onUpdateStudent={(s) => setStudents(prev => prev.map(old => old && old.id === s.id ? s : old))} onAddBorrowing={(b) => { setBorrowings(prev => [...prev, b]); addAuditLog('Library Issue', b.bookTitle, 'Administrative'); }} />
        )}

        {user.role === 'admin' && (
          <AdminDashboard user={user} reports={reports} students={students} users={users} invoices={invoices} payments={payments} expenses={expenses} messages={messages} leaveApplications={leaveApplications} requisitions={requisitions} auditLogs={auditLogs} settings={settings || DEFAULT_SETTINGS} onUpdateReport={updateReport} onUpdateStudent={(s) => setStudents(prev => prev.map(old => old && old.id === s.id ? s : old))} onAddStudent={(s) => { setStudents(prev => [...prev, s]); addAuditLog('Student Enroll', s.name, 'Enrolment'); }} onUpdateUser={handleUpdateUser} onSendMessage={(m) => setMessages(prev => [...prev, m])} onEditMessage={(id, c) => setMessages(prev => prev.map(m => m.id === id ? {...m, content: c} : m))} onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))} onMarkThreadRead={markThreadAsRead} onUpdateLeaveStatus={updateLeaveStatus} onUpdateRequisitionStatus={updateRequisitionStatus} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} onRestore={handleRestore} />
        )}

        {user.role === 'accountant' && (
          <AccountantDashboard 
            students={students.filter(i => i !== null)} 
            users={users.filter(i => i !== null)}
            invoices={invoices.filter(i => i !== null)} 
            expenses={expenses.filter(i => i !== null)} 
            payments={payments.filter(i => i !== null)} 
            payroll={payroll.filter(i => i !== null)}
            budgets={budgets.filter(i => i !== null)}
            bankTransactions={bankTransactions.filter(i => i !== null)}
            onAddInvoice={(i) => { setInvoices(prev => [i, ...prev]); addAuditLog('Invoice Gen', i.studentName, 'Financial'); }} 
            onAddPayment={(p) => { 
              setPayments(prev => [p, ...prev]); 
              if (p.invoiceId) setInvoices(prev => prev.map(inv => inv && inv.id === p.invoiceId ? {...inv, paidAmount: inv.paidAmount + p.amount, status: (inv.paidAmount + p.amount) >= inv.total ? 'paid' : 'partial'} : inv));
              addAuditLog('Payment Recv', `${p.amount} from student`, 'Financial'); 
            }} 
            onAddExpense={(e) => { setExpenses(prev => [e, ...prev]); addAuditLog('Expense Rec', e.description, 'Financial'); }}
            onUpdatePayroll={(p) => setPayroll(prev => { const exists = prev.find(old => old && old.id === p.id); return exists ? prev.map(old => old && old.id === p.id ? p : old) : [...prev, p]; })}
            onUpdateBudget={(b) => setBudgets(prev => { const exists = prev.find(old => old && old.category === b.category); return exists ? prev.map(old => old && old.category === b.category ? b : old) : [...prev, b]; })}
            onAddBankTransaction={(t) => setBankTransactions(prev => [t, ...prev])}
            onReversePayment={(id) => {
              setPayments(prev => prev.map(p => p && p.id === id ? {...p, isReversed: true} : p));
              addAuditLog('Payment Reverse', `ID: ${id}`, 'Financial');
            }}
          />
        )}

        {user.role === 'headteacher' && (
          <HeadteacherDashboard user={user} reports={reports.filter(i => i !== null)} users={users.filter(i => i !== null)} messages={messages.filter(i => i !== null)} leaveApplications={leaveApplications.filter(i => i !== null)} requisitions={requisitions.filter(i => i !== null)} onUpdateReport={updateReport} onSendMessage={(m) => setMessages(prev => [...prev, m])} onEditMessage={(id, c) => setMessages(prev => prev.map(m => m.id === id ? {...m, content: c} : m))} onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))} onMarkThreadRead={markThreadAsRead} onUpdateLeaveStatus={updateLeaveStatus} onUpdateRequisitionStatus={updateRequisitionStatus} />
        )}
        
        {user.role === 'librarian' && (
          <LibrarianDashboard user={user} students={students.filter(i => i !== null)} users={users.filter(i => i !== null)} books={books.filter(i => i !== null)} borrowings={borrowings.filter(i => i !== null)} messages={filteredMessages} onAddBook={(b) => setBooks(prev => [...prev, b])} onEditBook={(b) => setBooks(prev => prev.map(old => old && old.id === b.id ? b : old))} onDeleteBook={(id) => setBooks(prev => prev.filter(b => b && b.id !== id))} onAddBorrowing={(b) => setBorrowings(prev => [...prev, b])} onReturnBook={updateLeaveStatus as any} onPayFine={updateLeaveStatus as any} onSendMessage={(m) => setMessages(prev => [...prev, m])} onBroadcastMessage={(c, s, t) => {}} onEditMessage={(id, c) => setMessages(prev => prev.map(m => m.id === id ? {...m, content: c} : m))} onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))} onMarkThreadRead={markThreadAsRead} />
        )}

        {user.role === 'parent' && (
          <ParentDashboard user={user} reports={reports.filter(r => r && r.studentId === user.studentId && r.status === 'approved')} invoices={invoices.filter(i => i && i.studentId === user.studentId)} payments={payments.filter(p => p && p.studentId === user.studentId)} messages={filteredMessages} students={students.filter(i => i !== null)} onSendMessage={(m) => setMessages(prev => [...prev, m])} onEditMessage={(id, c) => setMessages(prev => prev.map(m => m.id === id ? {...m, content: c} : m))} onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))} onMarkThreadRead={markThreadAsRead} />
        )}
      </main>
    </div>
  );
};

export default App;
