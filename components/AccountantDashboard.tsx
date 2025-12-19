
import React, { useState, useMemo } from 'react';
import { Student, Invoice, ExpenseRecord, PaymentRecord, User, PayrollRecord, BudgetRecord, BankTransaction } from '../types';
import { FEE_STRUCTURE, CLASSES } from '../constants';

interface AccountantDashboardProps {
  students: Student[];
  users: User[];
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  payments: PaymentRecord[];
  payroll: PayrollRecord[];
  budgets: BudgetRecord[];
  bankTransactions: BankTransaction[];
  onAddInvoice: (invoice: Invoice) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onAddExpense: (expense: ExpenseRecord) => void;
  onUpdatePayroll: (p: PayrollRecord) => void;
  onUpdateBudget: (b: BudgetRecord) => void;
  onAddBankTransaction: (t: BankTransaction) => void;
  onReversePayment: (id: string) => void;
}

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({
  students, users, invoices, expenses, payments, payroll, budgets, bankTransactions,
  onAddInvoice, onAddPayment, onAddExpense, onUpdatePayroll, onUpdateBudget, onAddBankTransaction, onReversePayment
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'payroll' | 'banking' | 'budget' | 'reports' | 'fees'>('overview');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRecord | null>(null);
  const [selectedStudentAccount, setSelectedStudentAccount] = useState<string | null>(null);

  // Date Range State for Reports
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Overall Stats
  const activePayments = payments.filter(p => !p.isReversed);
  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalReceived = activePayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayrollPaid = payroll.filter(p => p.status === 'paid').reduce((a, b) => a + b.netPay, 0);
  const totalOut = totalExpenses + totalPayrollPaid;
  const surplus = totalReceived - totalOut;
  const outstandingFees = totalInvoiced - totalReceived;

  const todayStr = new Date().toLocaleDateString('en-GB');
  const feesToday = activePayments.filter(p => p.date.includes(todayStr)).reduce((a, b) => a + b.amount, 0);

  // Alerts
  const alerts = useMemo(() => {
    const list: string[] = [];
    if (surplus < 0) list.push("🚨 Deficit Alert: Expenses exceed collections.");
    if (outstandingFees > 5000000) list.push("⚠️ High Arrears: Outstanding fees exceed 5M UGX.");
    return list;
  }, [surplus, outstandingFees]);

  const reportData = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const filterFn = (item: { date: string }) => {
      const d = new Date(item.date);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };
    return {
      payments: activePayments.filter(filterFn),
      expenses: expenses.filter(filterFn),
      payroll: payroll.filter(p => p.paymentDate && filterFn({ date: p.paymentDate }))
    };
  }, [activePayments, expenses, payroll, startDate, endDate]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-[32px] shadow-2xl mb-8 border border-slate-50 max-w-[95%] mx-auto overflow-x-auto no-scrollbar">
        <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Overview" />
        <NavBtn active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon="📄" label="Fees" />
        <NavBtn active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon="💸" label="Expenses" />
        <NavBtn active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} icon="👷" label="Payroll" />
        <NavBtn active={activeTab === 'banking'} onClick={() => setActiveTab('banking')} icon="🏦" label="Banking" />
        <NavBtn active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon="📅" label="Budget" />
        <NavBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="📈" label="Reports" />
        <NavBtn active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} icon="⚙️" label="Policy" />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Invoiced" value={totalInvoiced} unit="UGX" color="indigo" icon="🏦" />
            <StatCard label="Collected Today" value={feesToday} unit="UGX" color="emerald" icon="✅" />
            <StatCard label="Profit / Deficit" value={surplus} unit="UGX" color={surplus >= 0 ? "emerald" : "rose"} icon="📈" />
            <StatCard label="Total Arrears" value={outstandingFees} unit="UGX" color="amber" icon="⏳" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-50">
                <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Recent Collections</h3>
                <div className="space-y-3">
                   {activePayments.slice(0, 5).reverse().map(p => (
                     <div key={p.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">💰</div>
                           <div>
                              <p className="font-black text-slate-700">{p.amount.toLocaleString()} UGX</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.method} • {p.date}</p>
                           </div>
                        </div>
                        <button onClick={() => setViewingReceipt(p)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View Receipt</button>
                     </div>
                   ))}
                   {activePayments.length === 0 && <p className="text-center py-20 text-slate-300 font-bold uppercase text-xs">No records found</p>}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-50">
                 <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Quick Operations</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionBtn icon="📄" label="Invoice" onClick={() => setShowInvoiceModal(true)} />
                    <ActionBtn icon="✅" label="Receipt" onClick={() => setShowPaymentModal(true)} />
                    <ActionBtn icon="📉" label="Expense" onClick={() => setShowExpenseModal(true)} />
                    <ActionBtn icon="👷" label="Payroll" onClick={() => setActiveTab('payroll')} />
                 </div>
              </section>
            </div>

            <div className="space-y-8">
               <section className="bg-rose-50 p-8 rounded-[40px] shadow-xl border border-rose-100">
                  <h3 className="text-rose-900 font-black text-xs uppercase tracking-widest mb-4">Financial Alerts</h3>
                  <div className="space-y-3">
                     {alerts.length > 0 ? alerts.map((a, i) => (
                       <div key={i} className="p-4 bg-white rounded-2xl text-[11px] font-bold text-rose-700 shadow-sm border border-rose-100 animate-pulse-slow">{a}</div>
                     )) : (
                       <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">System healthy. No alerts.</p>
                     )}
                  </div>
               </section>

               <section className="bg-indigo-900 p-8 rounded-[40px] shadow-2xl text-white">
                  <h3 className="text-lg font-black tracking-tighter mb-4 uppercase">Cash Position</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-xs opacity-60">Termly Collections</span>
                        <span className="font-black">{totalReceived.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs opacity-60">Pending Dues</span>
                        <span className="font-black text-rose-300">{outstandingFees.toLocaleString()}</span>
                     </div>
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Student Fee Accounts</h3>
              <button onClick={() => setShowInvoiceModal(true)} className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all">New Invoice</button>
           </div>
           
           <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                 <input placeholder="Search pupil fee accounts..." className="w-full max-w-md p-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold shadow-sm" />
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50">
                       <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Student</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Class</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Total Invoiced</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Arrears</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {students.map(s => {
                         const studentInvoices = invoices.filter(i => i.studentId === s.id);
                         const studentPayments = activePayments.filter(p => p.studentId === s.id);
                         const totalInv = studentInvoices.reduce((a, b) => a + b.total, 0);
                         const totalPaid = studentPayments.reduce((a, b) => a + b.amount, 0);
                         const arrears = totalInv - totalPaid;
                         return (
                           <tr key={s.id} className="hover:bg-slate-50/50 group">
                              <td className="px-8 py-5 font-black text-slate-700">{s.name}</td>
                              <td className="px-8 py-5 text-xs text-slate-400 font-black uppercase">{s.className}</td>
                              <td className="px-8 py-5 font-black text-indigo-900">{totalInv.toLocaleString()}</td>
                              <td className="px-8 py-5 text-center">
                                 <span className={`font-black ${arrears > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{arrears.toLocaleString()}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button onClick={() => setShowPaymentModal(true)} className="bg-indigo-50 text-indigo-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-indigo-900 hover:text-white transition-all">Record Payment</button>
                              </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Staff Payroll Management</h3>
              <button onClick={() => setShowPayrollModal(true)} className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all">Generate Payslips</button>
           </div>
           
           <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-slate-50">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Staff Member</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Month/Year</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Net Pay</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Payslip</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {payroll.map(p => (
                      <tr key={p.id}>
                         <td className="px-8 py-5 font-black text-slate-700">{p.staffName}</td>
                         <td className="px-8 py-5 text-xs text-slate-400 font-bold">{p.month} {p.year}</td>
                         <td className="px-8 py-5 font-black text-indigo-900">{p.netPay.toLocaleString()} UGX</td>
                         <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button className="text-indigo-900 font-black text-[9px] uppercase tracking-widest hover:underline">Download PDF</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              {payroll.length === 0 && <p className="py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">No payroll entries for the current period.</p>}
           </div>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Bank & Cash Management</h3>
              <button onClick={() => setShowBankModal(true)} className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all">New Entry</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100">
                 <h4 className="text-xl font-black mb-8 uppercase tracking-tighter">Bank Reconciliation</h4>
                 <div className="space-y-6">
                    <BankCard name="Main Fees Account (Stanbic)" balance={surplus * 0.7} />
                    <BankCard name="Operations (Centenary)" balance={surplus * 0.3} />
                    <BankCard name="Cash on Hand" balance={1500000} />
                 </div>
              </section>

              <section className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100">
                 <h4 className="text-xl font-black mb-8 uppercase tracking-tighter">Recent Deposits</h4>
                 <div className="space-y-4">
                    {bankTransactions.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                         <div>
                            <p className="font-black text-slate-700">{t.description}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{t.date} • {t.reference}</p>
                         </div>
                         <p className={`font-black ${t.type === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {t.type === 'Deposit' ? '+' : '-'}{t.amount.toLocaleString()}
                         </p>
                      </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Annual Budget Performance</h3>
              <button onClick={() => setShowBudgetModal(true)} className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all">Setup Budget</button>
           </div>
           
           <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100">
              <div className="space-y-10">
                 {['Scholastic', 'Utilities', 'Maintenance', 'Salaries'].map(cat => {
                   const budget = budgets.find(b => b.category === cat)?.allocated || 0;
                   const actual = expenses.filter(e => e.category === cat).reduce((a, b) => a + b.amount, 0);
                   const percentage = budget > 0 ? (actual / budget) * 100 : 0;
                   
                   return (
                     <div key={cat} className="space-y-4">
                        <div className="flex justify-between items-end">
                           <div>
                              <h4 className="font-black text-slate-800 text-lg">{cat}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual: {actual.toLocaleString()} / Allocated: {budget.toLocaleString()}</p>
                           </div>
                           <span className={`text-[10px] font-black uppercase ${percentage > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {percentage.toFixed(1)}% Used
                           </span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                           <div className={`h-full transition-all duration-1000 ${percentage > 90 ? 'bg-rose-500' : 'bg-indigo-900'}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <section className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
             <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Expenditure Tracking</h2>
             <button onClick={() => setShowExpenseModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-[24px] font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 uppercase text-xs tracking-widest">
               - Record Expense
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Vendor/Category</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Description</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-10 py-6">
                       <p className="font-black text-slate-800 text-sm">{exp.vendor || 'General Vendor'}</p>
                       <p className="text-[9px] font-black text-indigo-500 uppercase">{exp.category}</p>
                    </td>
                    <td className="px-10 py-6 font-bold text-slate-600 text-xs">{exp.description}</td>
                    <td className="px-10 py-6 font-black text-rose-600">-{exp.amount.toLocaleString()}</td>
                    <td className="px-10 py-6">
                       <button className="bg-slate-100 text-slate-400 p-2 rounded-lg hover:text-indigo-900">📄</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reports, Policy segments remain largely same but with Audit Export buttons */}
      {activeTab === 'reports' && (
        <div className="space-y-10 animate-fadeIn">
           <div className="bg-indigo-900 text-white p-10 rounded-[50px] shadow-2xl">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black tracking-tighter">Compliance & Audit Desk</h2>
                 <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105">Export Audit PDF</button>
              </div>
              <div className="flex gap-4 mt-8">
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white/10 p-3 rounded-xl text-sm outline-none border border-white/20" />
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white/10 p-3 rounded-xl text-sm outline-none border border-white/20" />
              </div>
           </div>

           <section className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden">
             <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Full Transaction Ledger</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Entity</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase">Details</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase text-right">In/Out</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...payments, ...expenses]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((item, idx) => {
                        const isPayment = 'method' in item;
                        return (
                          <tr key={idx} className={`${(item as any).isReversed ? 'opacity-40 line-through' : ''}`}>
                            <td className="px-10 py-6 text-xs font-bold text-slate-500">{item.date}</td>
                            <td className="px-10 py-6 font-black text-slate-700">{isPayment ? 'Student Collection' : (item as any).vendor || 'Expenditure'}</td>
                            <td className="px-10 py-6 text-xs font-medium text-slate-400">{(item as any).description || `Fee Payment via ${(item as any).method}`}</td>
                            <td className={`px-10 py-6 text-right font-black ${isPayment ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {isPayment ? '+' : '-'}{item.amount.toLocaleString()}
                            </td>
                            <td className="px-10 py-6 text-center">
                               {isPayment && !(item as any).isReversed && (
                                 <button onClick={() => onReversePayment(item.id)} className="text-[8px] font-black text-rose-500 border border-rose-500 px-2 py-1 rounded hover:bg-rose-500 hover:text-white transition-all uppercase">Reverse</button>
                               )}
                               {(item as any).isReversed && <span className="text-[8px] font-black text-rose-600 uppercase">Reversed</span>}
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'fees' && (
        <section className="bg-white rounded-[60px] shadow-2xl border border-slate-100 p-12 animate-fadeIn">
           <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
              <div className="p-5 bg-emerald-100 text-emerald-600 rounded-[32px] text-3xl shadow-inner">⚙️</div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Fee Structure Policy</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Fee Categories & Defaults</p>
              </div>
           </div>
           
           <div className="overflow-x-auto rounded-[40px] border border-slate-100 shadow-inner">
             <table className="w-full">
               <thead className="bg-indigo-900 text-white">
                 <tr>
                   <th className="px-10 py-6 text-left font-black uppercase text-xs tracking-widest">Category</th>
                   <th className="px-10 py-6 font-black uppercase text-xs tracking-widest text-center">Kindergarten</th>
                   <th className="px-10 py-6 font-black uppercase text-xs tracking-widest text-center">Grades 1 – 3</th>
                   <th className="px-10 py-6 font-black uppercase text-xs tracking-widest text-center">Grades 4 – 6</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {FEE_STRUCTURE.map((fee, idx) => (
                   <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                     <td className="px-10 py-6 font-black text-slate-700">{fee.particular}</td>
                     <td className="px-10 py-6 text-center font-black text-indigo-900">{fee.k}</td>
                     <td className="px-10 py-6 text-center font-black text-indigo-900">{fee.g13}</td>
                     <td className="px-10 py-6 text-center font-black text-indigo-900">{fee.g46}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      )}

      {/* MODALS */}
      {showInvoiceModal && <InvoiceModal students={students} onClose={() => setShowInvoiceModal(false)} onSubmit={onAddInvoice} />}
      {showPaymentModal && <PaymentModal invoices={invoices.filter(i => i.status !== 'paid')} onClose={() => setShowPaymentModal(false)} onSubmit={onAddPayment} />}
      {showExpenseModal && <ExpenseModal onClose={() => setShowExpenseModal(false)} onSubmit={onAddExpense} />}
      {showBudgetModal && <BudgetModal onClose={() => setShowBudgetModal(false)} onSubmit={onUpdateBudget} />}
      {showPayrollModal && <PayrollModal users={users} onClose={() => setShowPayrollModal(false)} onSubmit={onUpdatePayroll} />}
      {showBankModal && <BankModal onClose={() => setShowBankModal(false)} onSubmit={onAddBankTransaction} />}
      
      {viewingReceipt && <ReceiptModal payment={viewingReceipt} student={students.find(s => s.id === viewingReceipt.studentId)} onClose={() => setViewingReceipt(null)} />}
    </div>
  );
};

// --- Sub-components for Modals ---

const InvoiceModal = ({ students, onClose, onSubmit }: any) => {
  const [sid, setSid] = useState('');
  const [amt, setAmt] = useState('');
  const [disc, setDisc] = useState('0');
  const [desc, setDesc] = useState('Term Fees');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Fee Invoicing</h3>
        <div className="space-y-4">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={sid} onChange={e => setSid(e.target.value)}>
              <option value="">Select Pupil</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
           </select>
           <input placeholder="Base Amount" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={amt} onChange={e => setAmt(e.target.value)} />
           <input placeholder="Discount / Waiver" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={disc} onChange={e => setDisc(e.target.value)} />
           <input placeholder="Description" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Discard</button>
           <button onClick={() => {
             const student = students.find((s: any) => s.id === sid);
             if (!student || !amt) return;
             const total = parseFloat(amt) - parseFloat(disc);
             onSubmit({ id: Math.random().toString(36).substr(2, 9), studentId: sid, studentName: student.name, date: new Date().toLocaleDateString('en-GB'), dueDate: 'Ongoing', total, paidAmount: 0, status: 'unpaid', items: [{ description: desc, amount: total }], discount: parseFloat(disc) });
             onClose();
           }} className="flex-[2] bg-indigo-900 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Gen Invoice</button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ invoices, onClose, onSubmit }: any) => {
  const [invId, setInvId] = useState('');
  const [amt, setAmt] = useState('');
  const [method, setMethod] = useState('Cash');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-emerald-600 mb-6 uppercase tracking-tighter">Collection Entry</h3>
        <div className="space-y-4">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={invId} onChange={e => setInvId(e.target.value)}>
              <option value="">Select Invoice to Credit</option>
              {invoices.map((i: any) => <option key={i.id} value={i.id}>{i.studentName} - Balance: {(i.total - i.paidAmount).toLocaleString()}</option>)}
           </select>
           <input placeholder="Collection Amount" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={amt} onChange={e => setAmt(e.target.value)} />
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={method} onChange={e => setMethod(e.target.value)}>
              <option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option><option>Card</option>
           </select>
        </div>
        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Cancel</button>
           <button onClick={() => {
             const inv = invoices.find((i: any) => i.id === invId);
             if (!inv || !amt) return;
             onSubmit({ id: Math.random().toString(36).substr(2, 9), invoiceId: invId, studentId: inv.studentId, amount: parseFloat(amt), date: new Date().toLocaleDateString('en-GB'), method, reference: `REC-${Math.random().toString(36).substr(2, 5).toUpperCase()}` });
             onClose();
           }} className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Finalize Receipt</button>
        </div>
      </div>
    </div>
  );
};

const ExpenseModal = ({ onClose, onSubmit }: any) => {
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('Scholastic');
  const [vendor, setVendor] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-rose-600 mb-6 uppercase tracking-tighter">Expenditure Entry</h3>
        <div className="space-y-4">
           <input placeholder="Vendor / Recipient" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={vendor} onChange={e => setVendor(e.target.value)} />
           <input placeholder="Brief Description" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={desc} onChange={e => setDesc(e.target.value)} />
           <input placeholder="Amount (UGX)" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={amt} onChange={e => setAmt(e.target.value)} />
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={cat} onChange={e => setCat(e.target.value)}>
              <option>Scholastic</option><option>Utilities</option><option>Salaries</option><option>Maintenance</option><option>Other</option>
           </select>
        </div>
        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 font-black text-slate-400 uppercase text-xs">Cancel</button>
           <button onClick={() => {
             if (!desc || !amt) return;
             onSubmit({ id: Math.random().toString(36).substr(2, 9), description: desc, amount: parseFloat(amt), category: cat, date: new Date().toLocaleDateString('en-GB'), vendor, recordedBy: 'Accountant' });
             onClose();
           }} className="flex-[2] bg-rose-600 text-white font-black py-4 rounded-3xl shadow-xl uppercase text-xs">Confirm Payout</button>
        </div>
      </div>
    </div>
  );
};

const BudgetModal = ({ onClose, onSubmit }: any) => {
  const [cat, setCat] = useState('Scholastic');
  const [amt, setAmt] = useState('');
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Budget Allocation</h3>
        <div className="space-y-4">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={cat} onChange={e => setCat(e.target.value)}>
              <option>Scholastic</option><option>Utilities</option><option>Salaries</option><option>Maintenance</option><option>Other</option>
           </select>
           <input placeholder="Annual Limit" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={amt} onChange={e => setAmt(e.target.value)} />
        </div>
        <button onClick={() => { if(!amt) return; onSubmit({ category: cat, allocated: parseFloat(amt), year: '2025' }); onClose(); }} className="w-full bg-indigo-900 text-white font-black py-4 rounded-3xl mt-8 shadow-xl uppercase text-xs">Set Allocation</button>
      </div>
    </div>
  );
};

const PayrollModal = ({ users, onClose, onSubmit }: any) => {
  const staff = users.filter((u: any) => u.role !== 'parent');
  const [sid, setSid] = useState('');
  const [sal, setSal] = useState('');
  const [all, setAll] = useState('0');
  const [ded, setDed] = useState('0');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Salary Disbursement</h3>
        <div className="space-y-4">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={sid} onChange={e => setSid(e.target.value)}>
              <option value="">Select Staff Member</option>
              {staff.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
           </select>
           <input placeholder="Base Salary" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={sal} onChange={e => setSal(e.target.value)} />
           <div className="grid grid-cols-2 gap-4">
              <input placeholder="Allowances" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={all} onChange={e => setAll(e.target.value)} />
              <input placeholder="Deductions" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={ded} onChange={e => setDed(e.target.value)} />
           </div>
        </div>
        <button onClick={() => {
          const s = staff.find((u: any) => u.id === sid);
          if(!s || !sal) return;
          const net = parseFloat(sal) + parseFloat(all) - parseFloat(ded);
          onSubmit({ id: Math.random().toString(36).substr(2, 9), staffId: sid, staffName: s.name, baseSalary: parseFloat(sal), allowances: parseFloat(all), deductions: parseFloat(ded), netPay: net, month: 'December', year: '2025', status: 'paid', paymentDate: new Date().toLocaleDateString('en-GB') });
          onClose();
        }} className="w-full bg-indigo-900 text-white font-black py-4 rounded-3xl mt-8 shadow-xl uppercase text-xs">Authorize Pay</button>
      </div>
    </div>
  );
};

const BankModal = ({ onClose, onSubmit }: any) => {
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [type, setType] = useState('Deposit');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 animate-scaleIn">
        <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase tracking-tighter">Bank Ledger Entry</h3>
        <div className="space-y-4">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={type} onChange={e => setType(e.target.value)}>
              <option>Deposit</option><option>Withdrawal</option>
           </select>
           <input placeholder="Reference / Chq No." className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={desc} onChange={e => setDesc(e.target.value)} />
           <input placeholder="Amount" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={amt} onChange={e => setAmt(e.target.value)} />
        </div>
        <button onClick={() => { if(!amt) return; onSubmit({ id: Math.random().toString(36).substr(2, 9), description: desc, amount: parseFloat(amt), type, date: new Date().toLocaleDateString('en-GB'), reference: desc, accountName: 'Main' }); onClose(); }} className="w-full bg-indigo-900 text-white font-black py-4 rounded-3xl mt-8 shadow-xl uppercase text-xs">Record Transaction</button>
      </div>
    </div>
  );
};

const ReceiptModal = ({ payment, student, onClose }: any) => (
  <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print">
    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 animate-scaleIn relative overflow-hidden">
       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16"></div>
       <div className="relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Netzah Fees Receipt</h3>
          <div className="h-px bg-slate-100 w-full"></div>
          <div className="space-y-3 text-left">
             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Reference</span><span className="text-slate-800">{payment.id}</span></div>
             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Date</span><span className="text-slate-800">{payment.date}</span></div>
             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Student</span><span className="text-slate-800">{student?.name}</span></div>
             <div className="flex justify-between text-lg font-black uppercase pt-4 border-t border-slate-50"><span className="text-slate-400">Paid</span><span className="text-emerald-600">{payment.amount.toLocaleString()} UGX</span></div>
          </div>
          <button onClick={() => window.print()} className="w-full bg-indigo-900 text-white font-black py-4 rounded-3xl uppercase text-xs shadow-xl">Print Copy</button>
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-300">Close</button>
       </div>
    </div>
  </div>
);

const BankCard = ({ name, balance }: { name: string, balance: number }) => (
  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
     <div>
        <p className="font-black text-slate-700">{name}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Balance</p>
     </div>
     <p className="text-lg font-black text-indigo-900">{balance.toLocaleString()} UGX</p>
  </div>
);

const NavBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 shrink-0 ${active ? 'bg-indigo-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const ActionBtn = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all gap-2 group">
     <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </button>
);

const StatCard = ({ label, value, unit, color, icon }: { label: string, value: number, unit: string, color: string, icon: string }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    rose: 'bg-rose-50 text-rose-900 border-rose-100',
    amber: 'bg-amber-50 text-amber-900 border-amber-100',
  };
  return (
    <div className={`p-8 rounded-[40px] border-2 ${colors[color]} shadow-2xl transition-all`}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-4xl">{icon}</span>
        <div className="text-right">
           <span className="text-2xl font-black tracking-tighter leading-none">{value.toLocaleString()}</span>
           <p className="text-[10px] font-black uppercase opacity-60">{unit}</p>
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</p>
    </div>
  );
};

export default AccountantDashboard;
