
import React, { useState, useMemo } from 'react';
import { User, LeaveApplication } from '../types';

interface LeaveApplicationFormProps {
  user: User;
  onSubmit: (leave: LeaveApplication) => void;
}

const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
    handoverPerson: '',
    handoverNotes: '',
    staffId: user.staffId || '',
    position: user.position || '',
    phone: user.phone || ''
  });

  const totalDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDays <= 0) {
      alert("Please select valid start and end dates.");
      return;
    }

    const application: LeaveApplication = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      staffId: formData.staffId,
      position: formData.position,
      phone: formData.phone,
      type: formData.type as any,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: totalDays,
      reason: formData.reason,
      handoverPerson: formData.handoverPerson,
      handoverNotes: formData.handoverNotes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onSubmit(application);
    setFormData({
      ...formData,
      startDate: '',
      endDate: '',
      reason: '',
      handoverPerson: '',
      handoverNotes: ''
    });
    alert("Leave application submitted successfully! It will now be reviewed by school management.");
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl border border-slate-100 max-w-4xl mx-auto animate-fadeIn relative">
      {/* Visual Header Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-indigo-900 rounded-b-full shadow-lg"></div>
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-3">Leave Application Form</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Faculty Document</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 1. Applicant Information */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest whitespace-nowrap">1. Applicant Information</h3>
             <div className="h-px w-full bg-indigo-50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Full Name</label>
              <div className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-bold text-slate-800 shadow-inner">
                {user.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Staff ID / Employee No.</label>
              <input 
                required 
                placeholder="Ex: NISC/FAC/042"
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm focus:shadow-indigo-50" 
                value={formData.staffId} 
                onChange={e => setFormData({...formData, staffId: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Position / Department</label>
              <input 
                required 
                placeholder="Ex: Class Teacher - Sweet Pea"
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm focus:shadow-indigo-50" 
                value={formData.position} 
                onChange={e => setFormData({...formData, position: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Phone Number (For SMS Notify)</label>
              <input 
                required 
                placeholder="Ex: +256..."
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm focus:shadow-indigo-50" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>
        </section>

        {/* 2. Leave Details */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest whitespace-nowrap">2. Leave Details</h3>
             <div className="h-px w-full bg-indigo-50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Type of Leave</label>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Sick', 'Annual', 'Casual', 'Maternity', 'Paternity', 'Compassionate', 'Other'].map(t => (
                  <button 
                    key={t} type="button"
                    onClick={() => setFormData({...formData, type: t})}
                    className={`px-5 py-3 rounded-[20px] text-[10px] font-black uppercase transition-all flex-1 min-w-[120px] ${formData.type === t ? 'bg-indigo-900 text-white shadow-xl scale-105 border-indigo-900' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Start Date</label>
              <input 
                type="date" required 
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">End Date</label>
              <input 
                type="date" required 
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2 p-6 bg-indigo-900 text-white rounded-[32px] shadow-2xl flex justify-between items-center animate-pulse-slow">
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total Duration</p>
                 <p className="text-3xl font-black">{totalDays} Calendar Days</p>
               </div>
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">📅</div>
            </div>
          </div>
        </section>

        {/* 3. Reason for Leave */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest whitespace-nowrap">3. Reason for Leave</h3>
             <div className="h-px w-full bg-indigo-50"></div>
          </div>
          <textarea 
            required 
            placeholder="Please provide a comprehensive explanation for your absence..."
            className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[40px] font-medium outline-none min-h-[160px] shadow-inner transition-all" 
            value={formData.reason} 
            onChange={e => setFormData({...formData, reason: e.target.value})} 
          />
        </section>

        {/* 4. Handover Information */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest whitespace-nowrap">4. Handover Information</h3>
             <div className="h-px w-full bg-indigo-50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Person Taking Over Duties</label>
              <input 
                required 
                placeholder="Ex: Teacher Sarah Namukasa"
                className="w-full p-5 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-[24px] font-bold outline-none transition-all shadow-sm" 
                value={formData.handoverPerson} 
                onChange={e => setFormData({...formData, handoverPerson: e.target.value})} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Handover Notes / Instructions</label>
              <textarea 
                required 
                placeholder="Specify classroom projects, active parent communications, or specific scholastic requirements..."
                className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[40px] font-medium outline-none min-h-[120px] shadow-inner transition-all" 
                value={formData.handoverNotes} 
                onChange={e => setFormData({...formData, handoverNotes: e.target.value})} 
              />
            </div>
          </div>
        </section>

        {/* 5. Declaration */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                 <h4 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                   <span className="p-2 bg-indigo-500 rounded-xl">🖋️</span> 5. Declaration
                 </h4>
                 <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
                   "I hereby apply for leave and confirm that the information provided is true and correct. I understand that approval is subject to school policy and the final decision rests with Management."
                 </p>
              </div>
              <button 
                type="submit" 
                className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-400 text-white font-black px-12 py-6 rounded-[32px] shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-3"
              >
                Confirm & Submit 🚀
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplicationForm;
