
import React, { useState } from 'react';
import { User, Student, ProgressReport, Assessment, Grade } from '../types';
import { CLASS_SKILL_DATA } from '../constants';
import { generateTeacherComment } from '../services/gemini';

interface ReportFormProps {
  user: User;
  students: Student[];
  onSubmit: (report: ProgressReport) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ user, students, onSubmit }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState('2025');
  const [attendance, setAttendance] = useState({ present: '', absent: '' });
  const [nextTermDate, setNextTermDate] = useState('');
  const [assessments, setAssessments] = useState<Assessment>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const categories = selectedStudent ? CLASS_SKILL_DATA[selectedStudent.className] || [] : [];

  const handleGradeChange = (catId: string, catName: string, skill: string, grade: Grade) => {
    setAssessments(prev => {
      const cat = prev[catId] || { name: catName, skills: {}, comment: '' };
      return {
        ...prev,
        [catId]: {
          ...cat,
          skills: { ...cat.skills, [skill]: grade }
        }
      };
    });
  };

  const handleCommentChange = (catId: string, comment: string) => {
    setAssessments(prev => ({
      ...prev,
      [catId]: { ...prev[catId], comment }
    }));
  };

  const handleAiComment = async (catId: string, catName: string) => {
    if (!selectedStudent || !assessments[catId]) return;
    setIsGenerating(catId);
    const comment = await generateTeacherComment(catName, assessments[catId].skills, selectedStudent.name);
    handleCommentChange(catId, comment);
    setIsGenerating(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const report: ProgressReport = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudent.id,
      learnerName: selectedStudent.name,
      childAge: selectedStudent.age,
      childClass: selectedStudent.className,
      term,
      academicYear: year,
      parentEmail: selectedStudent.parentEmail,
      daysPresent: attendance.present,
      daysAbsent: attendance.absent,
      nextTermDate,
      assessments,
      status: 'submitted',
      teacherId: user.id,
      createdAt: new Date().toISOString()
    };
    onSubmit(report);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-white p-6 md:p-12 rounded-[50px] shadow-2xl border border-slate-100 relative overflow-hidden">
      {/* Visual background element like the classroom floor */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-indigo-900/10"></div>
      
      {/* Centered Logo and Header - Replicated from PDF Page 1 */}
      <div className="flex flex-col items-center text-center mb-16 pt-4 animate-slideDown">
        <div className="w-40 h-40 bg-white p-4 rounded-[48px] shadow-2xl border border-slate-100 mb-8 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
           <img 
              src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" 
              alt="Logo" 
              className="w-32 h-32 object-contain"
            />
        </div>
        <div className="bg-indigo-900 text-white py-4 px-16 rounded-[24px] font-black text-3xl uppercase tracking-tighter shadow-2xl mb-4">
          Progress Report
        </div>
        <div className="bg-white border-2 border-teal-500/30 text-teal-600 px-8 py-2 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-sm">
          Nurturing & Training for Victory
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-indigo-50/30 p-8 rounded-[40px] border border-indigo-100 shadow-inner">
          <div className="col-span-full font-black text-indigo-900 border-b border-indigo-100 pb-2 mb-2 uppercase text-xs">I. Student Identity</div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Learner's Name</label>
            <select 
              className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all shadow-sm"
              onChange={e => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}
            >
              <option value="">Select Learner</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Academic Year</label>
            <input className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold" value={year} onChange={e => setYear(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Current Term</label>
            <select className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold" value={term} onChange={e => setTerm(e.target.value)}>
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Days Present</label>
            <input placeholder="Ex: 65" className="w-full p-4 border rounded-2xl bg-white shadow-sm font-bold" value={attendance.present} onChange={e => setAttendance({...attendance, present: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Days Absent</label>
            <input placeholder="Ex: 5" className="w-full p-4 border rounded-2xl bg-white shadow-sm font-bold" value={attendance.absent} onChange={e => setAttendance({...attendance, absent: e.target.value})} />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Next Term Start</label>
            <input type="date" className="w-full p-4 border rounded-2xl bg-white shadow-sm font-bold" value={nextTermDate} onChange={e => setNextTermDate(e.target.value)} />
          </div>
        </div>

        {selectedStudent && (
          <div className="animate-fadeIn space-y-16">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-8 bg-slate-50/50 p-6 md:p-10 rounded-[50px] border border-slate-200">
                <div className="flex flex-col md:flex-row items-center gap-6">
                   <div className={`${cat.color} text-white p-4 rounded-3xl shadow-lg transform rotate-[-2deg]`}>
                      <span className="text-4xl">{cat.icon}</span>
                   </div>
                   <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{cat.name}</h3>
                      <div className="h-1.5 w-24 bg-indigo-900/10 rounded-full mt-1"></div>
                   </div>
                </div>
                
                <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/50 border-b">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Assessment Area</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase text-center">Achievement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cat.skills.map((skill: string) => (
                        <tr key={skill} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4 text-sm font-bold text-slate-700">{skill}</td>
                          <td className="px-8 py-4">
                            <div className="flex justify-center gap-2">
                              {['EE', 'ME', 'AE', 'NI'].map(g => (
                                <button
                                  key={g} type="button"
                                  onClick={() => handleGradeChange(cat.id, cat.name, skill, g as Grade)}
                                  className={`w-12 h-10 rounded-xl text-xs font-black transition-all transform ${assessments[cat.id]?.skills[skill] === g ? 'bg-indigo-900 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-8 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest bg-indigo-50 px-4 py-1 rounded-full">Teacher's Observation (Sectional)</label>
                    <button 
                      type="button" 
                      onClick={() => handleAiComment(cat.id, cat.name)}
                      disabled={isGenerating === cat.id}
                      className="text-indigo-900 font-black text-[10px] uppercase tracking-widest border-2 border-indigo-900 px-4 py-2 rounded-xl hover:bg-indigo-900 hover:text-white transition-all shadow-sm"
                    >
                      {isGenerating === cat.id ? 'Refining...' : '✨ AI Assist'}
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-5 border-0 bg-slate-50/50 rounded-2xl shadow-inner outline-none focus:ring-4 focus:ring-indigo-100 h-28 text-sm font-medium italic"
                    placeholder={`Notes on ${selectedStudent.name}'s ${cat.name.toLowerCase()}...`}
                    value={assessments[cat.id]?.comment || ''}
                    onChange={e => handleCommentChange(cat.id, e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="bg-indigo-900 p-10 rounded-[60px] text-white shadow-2xl space-y-8">
               <div className="flex items-center gap-6">
                 <div className="text-5xl">🔑</div>
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Evaluation Key</h3>
                    <p className="opacity-70 text-sm font-medium">Official performance descriptor definitions</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <span className="bg-white text-indigo-900 w-12 h-8 flex items-center justify-center rounded-lg font-black shrink-0">EE</span>
                      <p className="text-xs leading-relaxed opacity-90"><strong>Exceeds Expectation:</strong> The child has mastered the required skills and produces work of high quality consistently.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="bg-white text-indigo-900 w-12 h-8 flex items-center justify-center rounded-lg font-black shrink-0">ME</span>
                      <p className="text-xs leading-relaxed opacity-90"><strong>Meets Expectation:</strong> The child has the required skills for the assessment area, and applies them regularly.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <span className="bg-white text-indigo-900 w-12 h-8 flex items-center justify-center rounded-lg font-black shrink-0">AE</span>
                      <p className="text-xs leading-relaxed opacity-90"><strong>Approaching Expectation:</strong> The child has a general understanding of the required skills and the ability to apply them occasionally.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="bg-white text-indigo-900 w-12 h-8 flex items-center justify-center rounded-lg font-black shrink-0">NI</span>
                      <p className="text-xs leading-relaxed opacity-90"><strong>Needs Improvement:</strong> The child has clear difficulties in understanding and/or acquiring the skills for the assessment area.</p>
                    </div>
                  </div>
               </div>
            </div>

            <button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-black py-8 rounded-[40px] shadow-2xl transition-all active:scale-95 text-2xl uppercase tracking-tighter hover:shadow-indigo-200">
              Submit Official Report to Headteacher
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReportForm;
