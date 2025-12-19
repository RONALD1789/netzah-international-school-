
import React from 'react';
import { ProgressReport } from '../types';
import { CLASS_SKILL_DATA } from '../constants';

interface OfficialReportViewProps {
  report: ProgressReport;
  onClose: () => void;
}

const OfficialReportView: React.FC<OfficialReportViewProps> = ({ report, onClose }) => {
  const categories = CLASS_SKILL_DATA[report.childClass] || [];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-0 md:p-6 overflow-y-auto no-print">
      <div className="relative max-w-[850px] w-full mx-auto my-0 md:my-8">
        
        {/* Sticky Utility Bar */}
        <div className="sticky top-4 left-0 right-0 mx-auto w-full max-w-[400px] bg-slate-900/90 text-white p-3 rounded-[24px] flex justify-between items-center z-[220] shadow-2xl border border-white/10 backdrop-blur-md mb-6 no-print">
           <div className="flex items-center gap-3 pl-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Official Document</p>
           </div>
           <div className="flex gap-2">
              <button onClick={() => window.print()} className="bg-white text-slate-900 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-teal-400 transition-all">Print</button>
              <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black">✕</button>
           </div>
        </div>

        {/* The Document */}
        <div className="report-paper-stack space-y-12 pb-20 print:space-y-0 print:pb-0">
          
          {/* PAGE 1: COVER */}
          <div className="a4-page bg-white relative shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none">
             {/* Architectural Background */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: 'repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 10px)' }}></div>
             
             <div className="relative z-10 h-full flex flex-col items-center justify-between py-24 px-16">
                <div className="w-full flex flex-col items-center">
                   <div className="w-40 h-40 bg-white p-3 rounded-full border-[10px] border-slate-900 shadow-2xl mb-12 flex items-center justify-center">
                      <img src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" className="w-28" alt="Logo" />
                   </div>
                   
                   <h1 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-900 mb-2">Netzah</h1>
                   <h2 className="text-lg font-bold uppercase tracking-[0.3em] text-teal-600 mb-12">International School</h2>

                   <div className="w-24 h-1 bg-slate-900 mb-12"></div>

                   <div className="bg-slate-900 text-white py-4 px-16 rounded-sm mb-16">
                      <h3 className="text-4xl font-black tracking-tight uppercase playfair">Progress Report</h3>
                   </div>

                   <div className="w-full max-w-md space-y-4">
                      <CoverField label="Name of Learner" value={report.learnerName} primary />
                      <div className="grid grid-cols-2 gap-4">
                         <CoverField label="Class" value={report.childClass} />
                         <CoverField label="Age" value={report.childAge} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <CoverField label="Academic Term" value={report.term} />
                         <CoverField label="Year" value={report.academicYear} />
                      </div>
                   </div>
                </div>

                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 italic">"Nurturing & Training for Victory"</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">© 2025 Netzah International | Official Academic Record</p>
                </div>
             </div>
          </div>

          {/* ASSESSMENT PAGES */}
          {categories.map((cat, idx) => (
             <div key={cat.id} className="a4-page bg-white p-20 flex flex-col shadow-2xl print:shadow-none">
                <div className="flex items-end justify-between border-b-4 border-slate-900 pb-6 mb-12">
                   <div className="flex items-center gap-6">
                      <div className={`${cat.color} text-white w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center text-3xl`}>{cat.icon}</div>
                      <div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Assessment Category</h4>
                         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{cat.name}</h2>
                      </div>
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase">Page {idx + 2}</p>
                </div>

                <div className="flex-1 overflow-hidden border border-slate-100 rounded-3xl mb-10 shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Domain</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Achievement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {cat.skills.map((skill: string) => (
                            <tr key={skill} className="hover:bg-slate-50/30 transition-colors">
                               <td className="px-10 py-5 text-sm font-bold text-slate-600 leading-relaxed">{skill}</td>
                               <td className="px-10 py-5 text-center">
                                  <span className="inline-block bg-slate-900 text-white w-10 py-1.5 rounded-lg font-black text-xs shadow-md">
                                     {report.assessments[cat.id]?.skills[skill] || '-'}
                                  </span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative">
                   <label className="absolute -top-3 left-8 bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">Sectional Observation</label>
                   <p className="text-sm font-medium italic text-slate-500 leading-relaxed pt-2">
                     {report.assessments[cat.id]?.comment || 'Consistently demonstrating positive development in this domain.'}
                   </p>
                </div>
             </div>
          ))}

          {/* FINAL PAGE: KEY & ENDORSEMENT */}
          <div className="a4-page bg-white p-20 flex flex-col shadow-2xl print:shadow-none">
             <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6 mb-12">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Final Appraisal</h2>
                <div className="bg-teal-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Certified</div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-12">
                <GradeKey code="EE" label="Exceeds Expectation" desc="Mastery consistently observed." />
                <GradeKey code="ME" label="Meets Expectation" desc="Skill applied regularly." />
                <GradeKey code="AE" label="Approaching Expectation" desc="General understanding developing." />
                <GradeKey code="NI" label="Needs Improvement" desc="Requires focused intervention." />
             </div>

             <div className="bg-slate-900 text-white p-10 rounded-[40px] mb-12 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Head of School Remarks</h4>
                <p className="text-sm font-medium italic leading-relaxed opacity-90">
                   {report.headRemarks || 'A productive term showcasing significant holistic growth. The learner continues to thrive within the ACE framework.'}
                </p>
             </div>

             <div className="mt-auto grid grid-cols-2 gap-16 pt-12 border-t border-slate-100">
                <div className="space-y-6">
                   <EndorsementField label="Date of Issue" value={new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                   <EndorsementField label="Next Term Commencement" value={report.nextTermDate || 'Consult Office'} />
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[40px] p-8 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 opacity-50">🖋️</div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Administrative Seal</p>
                   <p className="text-xs font-serif italic text-slate-300">Authorized Personnel Signature</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .a4-page {
          width: 100%;
          min-height: 1080px;
          background: #fff;
          position: relative;
        }
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            page-break-after: always;
            border: none !important;
          }
          .fixed { position: relative !important; top: 0 !important; padding: 0 !important; }
          .bg-slate-950/95 { background: white !important; }
          .report-paper-stack { space-y: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const CoverField = ({ label, value, primary }: { label: string, value: string, primary?: boolean }) => (
  <div className="space-y-1 w-full">
     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">{label}</p>
     <div className={`w-full py-3 px-6 rounded-xl border border-slate-100 bg-slate-50 font-black tracking-tight ${primary ? 'text-lg text-slate-900 bg-indigo-50/30' : 'text-sm text-slate-600 shadow-inner'}`}>
        {value}
     </div>
  </div>
);

const GradeKey = ({ code, label, desc }: { code: string, label: string, desc: string }) => (
  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
     <div className="bg-slate-900 text-white w-12 h-10 flex items-center justify-center rounded-xl font-black text-xs shrink-0">{code}</div>
     <div>
        <p className="text-[10px] font-black uppercase text-slate-800 leading-none mb-1">{label}</p>
        <p className="text-[9px] font-medium text-slate-400 leading-none">{desc}</p>
     </div>
  </div>
);

const EndorsementField = ({ label, value }: { label: string, value: string }) => (
  <div className="border-b-2 border-slate-900 pb-2">
     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
     <p className="text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default OfficialReportView;
