
import React, { useRef } from 'react';
import { Student } from '../types';
import { HOUSES } from '../constants';

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
  onUpdateStudent: (student: Student) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onClose, onUpdateStudent }) => {
  const house = HOUSES.find(h => h.name === student.house) || HOUSES[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateStudent({ ...student, profilePhoto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl relative overflow-hidden animate-scaleIn">
         <div className={`h-32 ${house.color} relative`}>
            <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-xl transition-all z-10">&times;</button>
         </div>
         <div className="px-10 pb-10">
            <div className="relative -mt-16 mb-6 text-center">
               <div 
                 onClick={handlePhotoClick}
                 className="w-32 h-32 bg-white rounded-[40px] p-2 shadow-2xl mx-auto border-4 border-white cursor-pointer group relative overflow-hidden"
               >
                  <div className={`w-full h-full ${house.light} rounded-[32px] flex items-center justify-center overflow-hidden`}>
                    {student.profilePhoto ? (
                      <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`text-4xl font-black ${house.text}`}>{student.firstName[0]}{student.lastName[0]}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
               </div>
               <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tighter">{student.name}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{student.officialId}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
               <div className="space-y-4">
                  <h5 className="font-black text-indigo-900 uppercase text-[10px] tracking-widest">Student Details</h5>
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-3">
                     <p className="flex justify-between font-black"><span className="text-slate-400">Class</span>{student.className}</p>
                     <p className="flex justify-between font-black"><span className="text-slate-400">Age</span>{student.age || 'N/A'}</p>
                     <p className="flex justify-between font-black"><span className="text-slate-400">Gender</span>{student.gender === 'M' ? 'Male' : 'Female'}</p>
                     <p className="flex justify-between font-black"><span className="text-slate-400">House</span>{student.house}</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <h5 className="font-black text-indigo-900 uppercase text-[10px] tracking-widest">Guardian Info</h5>
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-3">
                     <p className="font-black text-slate-800">{student.parentName}</p>
                     <p className="text-slate-500 font-bold text-xs">{student.parentPhone}</p>
                     <p className="text-slate-500 font-bold text-xs truncate">{student.parentEmail}</p>
                     <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-2">{student.physicalAddress}</p>
                  </div>
               </div>
            </div>

            <div className="mt-8">
               <h5 className="font-black text-indigo-900 uppercase text-[10px] tracking-widest mb-4">Bio & Remarks</h5>
               <div className="bg-indigo-50/50 p-6 rounded-[32px] italic text-slate-600 font-medium text-sm leading-relaxed border border-indigo-100/50">
                  "{student.bio || 'No profile bio available yet.'}"
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentProfile;
