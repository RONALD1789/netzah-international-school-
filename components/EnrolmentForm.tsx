
import React, { useState } from 'react';
import { Student } from '../types';
import { HOUSES } from '../constants';

interface EnrolmentFormProps {
  onAddStudent: (student: Student) => void;
  onCancel: () => void;
  existingStudentCount: number;
  className?: string;
}

const EnrolmentForm: React.FC<EnrolmentFormProps> = ({ onAddStudent, onCancel, existingStudentCount, className }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    gender: 'M',
    className: className || '',
    house: 'Faith',
    authorizedPickups: [{ name: '', phone: '', relationship: '' }],
    isGraduated: false
  });

  const generateOfficialId = () => {
    const year = new Date().getFullYear();
    const sequence = (existingStudentCount + 1).toString().padStart(3, '0');
    return `NISC/${year}/${sequence}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      officialId: generateOfficialId(),
      name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      dob: formData.dob || '',
      gender: formData.gender || 'M',
      nationality: formData.nationality || '',
      age: formData.age || '',
      className: formData.className || '',
      house: formData.house || 'Faith',
      bio: formData.bio || '',
      isGraduated: false,
      parentName: formData.parentName || '',
      parentEmail: formData.parentEmail || '',
      parentPhone: formData.parentPhone || '',
      physicalAddress: formData.physicalAddress || '',
      authorizedPickups: formData.authorizedPickups || [],
    };
    onAddStudent(student);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-10">
        <div className="bg-indigo-900 text-white py-4 px-12 inline-block rounded-3xl font-black text-2xl uppercase tracking-tighter mb-4 shadow-xl">
          New Student Admission
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Netzah International School Registry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">I. Student Profile</h3>
             <div className="flex-1 h-px bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">First Name</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Middle Name</label>
              <input className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, middleName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Last Name</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">D.O.B</label>
              <input type="date" required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Gender</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'M'|'F'})}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">House</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" value={formData.house} onChange={e => setFormData({...formData, house: e.target.value})}>
                {HOUSES.map(h => <option key={h.name} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
              <select required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>
                <option value="">Select Class</option>
                <option value="Sweet Pea">Sweet Pea</option>
                <option value="Sunbeams">Sunbeams</option>
                <option value="Spectrum">Spectrum</option>
                <option value="Shammah">Shammah</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Short Bio / Personality Notes</label>
            <textarea className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-medium italic outline-none h-24 transition-all" placeholder="Tell us about the child's interests..." onChange={e => setFormData({...formData, bio: e.target.value})} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">II. Parental Contact</h3>
             <div className="flex-1 h-px bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Primary Guardian</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, parentName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Address</label>
                <input type="email" required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile Phone</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold outline-none transition-all" onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-5 rounded-3xl transition-all uppercase text-xs tracking-widest">Discard</button>
          <button type="submit" className="flex-[2] bg-indigo-900 hover:bg-indigo-800 text-white font-black py-5 px-12 rounded-3xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest">Generate Official ID & Enrol</button>
        </div>
      </form>
    </div>
  );
};

export default EnrolmentForm;
