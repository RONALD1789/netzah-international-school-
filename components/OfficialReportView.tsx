
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
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-0 md:p-4 overflow-y-auto no-print">
      <div className="relative max-w-[800px] w-full mx-auto my-0 md:my-8 bg-white shadow-2xl rounded-none md:rounded-lg overflow-hidden">
        
        {/* Sticky Control Bar */}
        <div className="sticky top-0 bg-indigo-900 text-white p-4 flex justify-between items-center z-[110] no-print">
           <h4 className="font-black text-xs uppercase tracking-widest">Official Report Preview: {report.learnerName}</h4>
           <div className="flex gap-3">
              <button onClick={() => window.print()} className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all">Print Official Copy</button>
              <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">&times;</button>
           </div>
        </div>

        {/* The Paper Structure */}
        <div className="report-pages-container bg-gray-200 p-0 md:p-8 space-y-8 print:p-0 print:space-y-0 print:bg-white">
          
          {/* PAGE 1: COVER */}
          <div className="report-page bg-white relative overflow-hidden print:shadow-none print:m-0">
             {/* Sunburst Background Effect */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ background: 'radial-gradient(circle, #1e3a8a 0%, transparent 70%)' }}></div>
             <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.02] pointer-events-none">
                <div className="w-[150%] h-[150%] border-[40px] border-indigo-900 rounded-full"></div>
             </div>

             <div className="relative z-10 h-full flex flex-col items-center pt-20 px-12">
                {/* School Logo */}
                <div className="w-48 h-48 bg-white p-2 rounded-full border-4 border-indigo-900 shadow-xl mb-12 flex items-center justify-center overflow-hidden">
                   <img src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" className="w-40" alt="Netzah Logo" />
                </div>

                {/* Banner */}
                <div className="bg-[#1B3A5F] text-white py-3 px-20 rounded-lg shadow-xl mb-16 transform -rotate-1">
                   <h1 className="text-4xl font-black tracking-tighter uppercase">Progress Report</h1>
                </div>

                {/* Data Fields */}
                <div className="w-full max-w-2xl space-y-6 mb-20">
                   <div className="flex gap-4 items-center">
                      <span className="bg-[#A5F3FC] text-[#1B3A5F] font-black uppercase text-[10px] py-2 px-4 rounded-full whitespace-nowrap">Child's Name</span>
                      <div className="flex-1 bg-[#F1F5F9] rounded-full h-10 border-b-2 border-[#A5F3FC] flex items-center px-6 font-black text-slate-800">{report.learnerName}</div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Field label="Age" value={report.childAge} />
                      <Field label="Class" value={report.childClass} />
                      <Field label="Term" value={report.term.split(' ')[1]} />
                      <Field label="Year" value={report.academicYear} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Days Present" value={report.daysPresent} />
                      <Field label="Days Absent" value={report.daysAbsent} />
                   </div>
                </div>

                {/* Motto */}
                <div className="bg-[#D1FAE5] border-2 border-[#10B981]/30 py-4 px-12 rounded-2xl shadow-sm text-center mb-12">
                   <p className="text-[#065F46] font-black uppercase tracking-[0.3em] text-sm">Nurturing & Training for Victory</p>
                </div>

                {/* Classroom Illustration (Bottom) */}
                <div className="mt-auto w-full h-48 bg-cover bg-bottom opacity-80" style={{ backgroundImage: 'url(https://img.freepik.com/free-vector/preschool-classroom-interior-with-toys-furniture_107791-3850.jpg)' }}></div>
             </div>
          </div>

          {/* PAGES 2+: ASSESSMENT CATEGORIES */}
          {categories.map((cat, idx) => (
             <div key={cat.id} className="report-page bg-white p-12 flex flex-col print:shadow-none print:m-0">
                {/* Header Tab */}
                <div className="flex items-center gap-4 mb-10">
                   <div className={`${cat.color} text-white p-4 rounded-2xl shadow-lg flex items-center justify-center`}>
                      <span className="text-4xl">{cat.icon}</span>
                   </div>
                   <div className="bg-indigo-50 flex-1 py-4 px-8 rounded-r-full border-l-8 border-indigo-900">
                      <h2 className="text-xl font-black text-indigo-900 uppercase tracking-tight leading-tight">{cat.name}</h2>
                   </div>
                </div>

                {/* Table */}
                <div className="flex-1 border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-[#FEF3C7]">
                         <tr>
                            <th className="px-8 py-5 text-[11px] font-black text-indigo-900 uppercase tracking-widest w-2/3">Assessment Areas</th>
                            <th className="px-8 py-5 text-[11px] font-black text-indigo-900 uppercase tracking-widest text-center">Achievement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {cat.skills.map((skill: string) => (
                            <tr key={skill}>
                               <td className="px-8 py-4 text-xs font-bold text-slate-600 leading-relaxed">{skill}</td>
                               <td className="px-8 py-4 text-center">
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 inline-block min-w-[80px] font-black text-indigo-900 text-sm">
                                     {report.assessments[cat.id]?.skills[skill] || '-'}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {/* Comment Box */}
                <div className="mt-8 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Teacher's Comment:</label>
                   <div className="w-full p-8 border-2 border-slate-100 rounded-[40px] bg-slate-50 italic text-slate-600 font-medium text-sm leading-[1.8] min-h-[120px]">
                      {report.assessments[cat.id]?.comment || 'Progressing as expected.'}
                   </div>
                </div>

                <div className="mt-auto pt-10 text-center opacity-30">
                   <p className="text-[8px] font-black uppercase tracking-widest">Netzah International School Official Record • Page {idx + 2}</p>
                </div>
             </div>
          ))}

          {/* FINAL PAGE: EVALUATION KEY & REMARKS */}
          <div className="report-page bg-white p-16 flex flex-col print:shadow-none print:m-0">
             <div className="bg-indigo-900 text-white py-3 px-12 rounded-lg text-center mb-12 mx-auto inline-block">
                <h2 className="text-xl font-black uppercase tracking-widest">Evaluation Key</h2>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-12">
                <KeyItem code="EE" label="Exceeds Expectation" />
                <KeyItem code="ME" label="Meets Expectation" />
                <KeyItem code="AE" label="Approaching Expectation" />
                <KeyItem code="NI" label="Needs Improvement" />
             </div>

             <div className="bg-[#EFF6FF] p-10 rounded-[40px] border border-blue-100 mb-12 text-sm leading-[1.8] text-slate-700">
                <p className="font-black text-blue-900 mb-4 uppercase text-xs">Evaluation Explanation:</p>
                <p>Progress is observed daily and teacher records are used to assess achievement and areas that require improvement. Evaluation is based on age appropriate skills as well as individual child accomplishments. The children are not judged against the work of each other, but against assessment criteria in the WEE Learn curriculum, and the set objectives for each learning area, taking into consideration the range of activities the child has done over the term.</p>
                
                <div className="mt-6 space-y-4">
                   <p><strong>Exceeds Expectation:</strong> The child has mastered the required skills and produces work of high quality consistently.</p>
                   <p><strong>Meets Expectation:</strong> The child has the required skills for the assessment area, and applies them regularly.</p>
                   <p><strong>Approaching Expectation:</strong> The child has a general understanding of the required skills and the ability to apply them occasionally.</p>
                   <p><strong>Needs Improvement:</strong> The child has clear difficulties in understanding and/or acquiring the skills for the assessment area.</p>
                </div>
             </div>

             <div className="space-y-2 mb-12">
                <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-4">Headteacher's Remarks:</label>
                <div className="w-full p-8 border-2 border-indigo-100 rounded-[40px] bg-white italic text-slate-800 font-bold text-sm min-h-[140px] border-dashed">
                   {report.headRemarks || 'Final summary pending review.'}
                </div>
             </div>

             <div className="mt-auto grid grid-cols-2 gap-12 border-t pt-10">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Date</p>
                   <div className="border-b-2 border-slate-100 h-10 font-bold text-slate-800">{new Date(report.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Next Term Starts</p>
                   <div className="border-b-2 border-slate-100 h-10 font-bold text-slate-800">{report.nextTermDate || 'TBD'}</div>
                </div>
                <div className="col-span-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1 text-center">Authorized Signature</p>
                   <div className="mx-auto w-64 border-b-2 border-slate-200 h-16 flex items-center justify-center font-serif italic text-lg opacity-40">Administrative Seal</div>
                </div>
             </div>
          </div>

          {/* CONTACT PAGE */}
          <div className="report-page bg-white p-20 flex flex-col items-center justify-center text-center print:shadow-none print:m-0">
             <img src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" className="w-48 mb-10 opacity-40 grayscale" />
             <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Netzah</h2>
             <p className="text-xl font-bold text-teal-600 uppercase tracking-[0.4em] mb-12">International School</p>
             
             <div className="grid grid-cols-2 gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-lg">
                <p>Plot 763, Krespo Kizito Road, Masooli</p>
                <p>P.O. Box 23957 Kampala, Uganda</p>
                <p>+256 706 303 668</p>
                <p>netzahschoolug@gmail.com</p>
             </div>
          </div>

        </div>
      </div>

      <style>{`
        .report-page {
          width: 100%;
          min-height: 1050px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        @media print {
          body { margin: 0; background: white; }
          .no-print { display: none !important; }
          .report-pages-container { padding: 0 !important; background: white !important; }
          .report-page { 
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
            margin: 0 !important;
            padding: 2cm !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e3a8a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, value }: { label: string, value: string }) => (
  <div className="flex gap-4 items-center">
     <span className="bg-[#A5F3FC] text-[#1B3A5F] font-black uppercase text-[10px] py-1 px-4 rounded-full whitespace-nowrap">{label}</span>
     <div className="flex-1 bg-[#F1F5F9] rounded-full h-8 border-b border-[#A5F3FC] flex items-center px-4 font-black text-slate-700 text-xs truncate">{value}</div>
  </div>
);

const KeyItem = ({ code, label }: { code: string, label: string }) => (
  <div className="flex gap-4 items-center">
     <span className="bg-indigo-900 text-white w-10 h-8 flex items-center justify-center rounded-lg font-black text-xs shrink-0">{code}</span>
     <span className="text-xs font-bold text-slate-600">{label}</span>
  </div>
);

export default OfficialReportView;
