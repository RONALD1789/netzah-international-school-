
import React, { useState, useMemo } from 'react';
import { Student, AuditLog, ProgressReport } from '../types';

// Declare XLSX as a global constant for Excel export functionality
declare const XLSX: any;

interface ComplianceHubProps {
  students: Student[];
  auditLogs: AuditLog[];
  reports: ProgressReport[];
  onUpdateStudent?: (student: Student) => void;
}

const ComplianceHub: React.FC<ComplianceHubProps> = ({ students, auditLogs, reports, onUpdateStudent }) => {
  const [tab, setTab] = useState<'audit' | 'documents' | 'exports'>('audit');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [docType, setDocType] = useState<'transfer' | 'clearance'>('transfer');
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const exportToExcel = () => {
    const data = students.map(s => ({
      'Official ID': s.officialId,
      'Name': s.name,
      'Level': s.className,
      'House': s.house,
      'Gender': s.gender,
      'Status': s.isGraduated ? 'Graduated' : s.isTransferred ? 'Transferred' : 'Active',
      'Parent': s.parentName,
      'Phone': s.parentPhone,
      'Email': s.parentEmail
    }));
    
    // Using the globally declared XLSX library
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registry");
    XLSX.writeFile(wb, `NIS_Registry_${new Date().toLocaleDateString()}.xlsx`);
  };

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [selectedStudentId, students]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex gap-4 border-b border-slate-100">
         {(['audit', 'documents', 'exports'] as const).map(t => (
           <button 
            key={t}
            onClick={() => setTab(t)}
            className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'border-b-4 border-indigo-900 text-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {t}
           </button>
         ))}
      </div>

      {tab === 'audit' && (
        <section className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">System Audit Trail</h3>
              <span className="text-[9px] font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full uppercase">Read Only</span>
           </div>
           <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left">
                 <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr>
                       <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                       <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User</th>
                       <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                       <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Action & Context</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-8 py-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                         <td className="px-8 py-4">
                            <p className="text-[11px] font-black text-slate-700">{log.userName}</p>
                         </td>
                         <td className="px-8 py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              log.category === 'Financial' ? 'bg-emerald-50 text-emerald-600' :
                              log.category === 'Academic' ? 'bg-blue-50 text-blue-600' :
                              log.category === 'Security' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                              {log.category}
                            </span>
                         </td>
                         <td className="px-8 py-4">
                            <p className="text-[11px] font-bold text-slate-800">{log.action}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{log.details}</p>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>
      )}

      {tab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-[24px] flex items-center justify-center text-4xl">📊</div>
              <div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Student Registry</h3>
                 <p className="text-xs text-slate-400 font-medium mt-2">Export full active registry with parent contacts and class levels.</p>
              </div>
              <button 
                onClick={exportToExcel}
                className="bg-indigo-900 text-white w-full py-4 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105"
              >
                📥 Download Excel (XLSX)
              </button>
           </section>

           <section className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6 opacity-50 cursor-not-allowed">
              <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center text-4xl">🧾</div>
              <div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Financial Summary</h3>
                 <p className="text-xs text-slate-400 font-medium mt-2">Detailed income/expense breakdown for the current period.</p>
              </div>
              <button disabled className="bg-emerald-600 text-white w-full py-4 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl">
                Coming Soon
              </button>
           </section>
        </div>
      )}

      {tab === 'documents' && (
        <section className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 animate-fadeIn">
           <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Official Document Generator</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Target Student</label>
                    <select 
                      className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all"
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                    >
                       <option value="">-- Choose Pupil --</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.officialId})</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDocType('transfer')}
                      className={`p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-2 ${docType === 'transfer' ? 'bg-indigo-900 text-white border-indigo-900 shadow-xl' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                    >
                       <span className="text-3xl">✈️</span>
                       <span className="text-[10px] font-black uppercase">Transfer Letter</span>
                    </button>
                    <button 
                      onClick={() => setDocType('clearance')}
                      className={`p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-2 ${docType === 'clearance' ? 'bg-indigo-900 text-white border-indigo-900 shadow-xl' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                    >
                       <span className="text-3xl">✅</span>
                       <span className="text-[10px] font-black uppercase">Clearance Form</span>
                    </button>
                 </div>
              </div>

              <div className="flex flex-col justify-end pb-1">
                 <button 
                   disabled={!selectedStudentId}
                   onClick={() => setShowDocumentModal(true)}
                   className="bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
                 >
                   🚀 Generate {docType.toUpperCase()}
                 </button>
              </div>
           </div>
        </section>
      )}

      {showDocumentModal && selectedStudent && (
        <DocumentPreviewModal 
          student={selectedStudent} 
          type={docType} 
          onClose={() => setShowDocumentModal(false)} 
        />
      )}
    </div>
  );
};

const DocumentPreviewModal = ({ student, type, onClose }: { student: Student, type: 'transfer' | 'clearance', onClose: () => void }) => {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="relative max-w-4xl w-full my-8">
        <div className="absolute -top-16 right-0 flex gap-4 no-print">
          <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2">
            <span>🖨️</span> Print Document
          </button>
          <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl transition-all">&times;</button>
        </div>

        <div className="bg-white p-12 md:p-20 shadow-2xl rounded-sm print:rounded-none print:shadow-none print:m-0 min-h-[1050px] relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-16 border-b-4 border-indigo-900 pb-10">
             <div className="flex items-center gap-6">
                <img 
                  src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" 
                  alt="Logo" className="w-24 h-24 object-contain"
                />
                <div>
                   <h1 className="text-3xl font-black text-indigo-900 uppercase leading-none tracking-tighter">Netzah International School</h1>
                   <p className="text-[9px] font-black text-teal-600 uppercase tracking-[0.4em] mt-2 italic">Nurturing & Training for Victory</p>
                </div>
             </div>
             <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-1">
                <p>P.O. Box 72441, Kampala</p>
                <p>+256 700 000 000</p>
                <p>office@netzah.ac.ug</p>
             </div>
          </div>

          {/* Letter Body */}
          {type === 'transfer' ? (
            <div className="space-y-10 animate-slideUp">
               <div className="text-right font-black text-slate-800 text-sm mb-12">
                  <p>DATE: {dateStr}</p>
                  <p>REF: NISC/TR/{student.officialId.split('/').pop()}</p>
               </div>

               <div className="space-y-2">
                  <p className="font-black text-slate-800">To: The Head of School,</p>
                  <p className="font-bold text-slate-600">Prospective School Authority.</p>
               </div>

               <h2 className="text-xl font-black text-indigo-900 border-b-2 border-indigo-50 pb-2 uppercase tracking-tight text-center">Letter of Transfer & Good Standing</h2>

               <div className="space-y-6 text-slate-700 leading-[1.8] font-medium text-sm">
                  <p>This is to certify that <span className="font-black text-slate-900">{student.name}</span>, officially registered under ID <span className="font-black text-slate-900">{student.officialId}</span>, was a bonafide student of Netzah International School.</p>
                  
                  <p>The student was enrolled in the <span className="font-black text-slate-900">{student.className}</span> level and has maintained a record of commendable conduct and active participation in our ACE (Accelerated Christian Education) curriculum.</p>
                  
                  <p>We confirm that all administrative requirements and terminal reports up to the current date have been finalized. We highly recommend {student.firstName} for admission into your esteemed institution and wish them continued success in their academic and spiritual journey.</p>
               </div>

               <div className="pt-20 space-y-12">
                  <div className="flex justify-between items-end">
                     <div className="w-64 border-t-2 border-slate-900 pt-3 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Head of School Signature</p>
                        <p className="font-serif italic text-lg mt-2">The Management</p>
                     </div>
                     <div className="w-40 h-40 border-4 border-double border-indigo-900/10 rounded-full flex items-center justify-center text-center p-4">
                        <span className="text-[8px] font-black uppercase text-indigo-900/30">Official School Seal</span>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-10 animate-slideUp">
               <h2 className="text-2xl font-black text-center text-indigo-900 uppercase border-b-4 border-slate-100 pb-4">Internal Student Clearance Form</h2>
               
               <div className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Learner's Name</p>
                     <p className="font-black text-slate-800">{student.name}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Official ID</p>
                     <p className="font-black text-slate-800">{student.officialId}</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <ClearanceRow label="1. Library Resources" dept="Librarian" />
                  <ClearanceRow label="2. Financial Standing (Fees)" dept="Bursar/Accountant" />
                  <ClearanceRow label="3. Academic Documents" dept="Registrar" />
                  <ClearanceRow label="4. Extra-Curricular / Uniforms" dept="Store Manager" />
               </div>

               <div className="bg-indigo-50 p-8 rounded-[40px] border-2 border-dashed border-indigo-100 text-center">
                  <p className="text-xs font-bold text-indigo-900 italic">"Once all sections are verified and signed, this pupil is cleared for exit/transfer documentation."</p>
               </div>
            </div>
          )}

          {/* Footer */}
          <div className="absolute bottom-12 left-12 right-12 text-center">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Victory Through Training</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClearanceRow = ({ label, dept }: { label: string, dept: string }) => (
  <div className="flex items-center gap-6 p-5 border-2 border-slate-100 rounded-[24px]">
     <div className="flex-1">
        <p className="font-black text-slate-800">{label}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dept} Verification</p>
     </div>
     <div className="w-48 h-10 border-b-2 border-slate-200"></div>
     <div className="w-10 h-10 rounded-xl border-2 border-slate-100"></div>
  </div>
);

export default ComplianceHub;
