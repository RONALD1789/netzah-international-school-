
import React from 'react';
import { Student } from '../types';
import { NEXT_LEVEL } from '../constants';

interface PromotionCertificateProps {
  student: Student;
  onClose: () => void;
}

const PromotionCertificate: React.FC<PromotionCertificateProps> = ({ student, onClose }) => {
  const today = new Date();
  const day = today.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();
  const promotedTo = NEXT_LEVEL[student.className] || "Next Grade";

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="relative max-w-5xl w-full">
        {/* Actions */}
        <div className="absolute -top-16 right-0 flex gap-4 no-print">
          <button 
            onClick={() => window.print()} 
            className="bg-teal-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>🖨️</span> Print Certificate
          </button>
          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-2xl transition-all shadow-lg"
          >
            &times;
          </button>
        </div>

        {/* Certificate Container */}
        <div className="certificate-paper bg-white p-1 md:p-2 shadow-2xl mx-auto print:shadow-none print:m-0" id="promotion-certificate">
          <div className="border-[3px] border-slate-800 p-1">
            <div className="border-[1px] border-slate-800 p-4 md:p-12 relative overflow-hidden bg-white min-h-[700px] flex flex-col justify-between">
              
              {/* Decorative Corner Dots - Replicating the image border style */}
              <div className="absolute top-2 left-2 w-4 h-4 border-2 border-slate-900 rounded-sm bg-slate-900 shadow-[2px_2px_0_rgba(0,0,0,0.2)]"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-2 border-slate-900 rounded-sm bg-slate-900 shadow-[-2px_2px_0_rgba(0,0,0,0.2)]"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-slate-900 rounded-sm bg-slate-900 shadow-[2px_-2px_0_rgba(0,0,0,0.2)]"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-slate-900 rounded-sm bg-slate-900 shadow-[-2px_-2px_0_rgba(0,0,0,0.2)]"></div>

              {/* Grid background effect (Subtle) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

              {/* Header Logos and Title */}
              <div className="flex justify-between items-start relative z-10 mb-8">
                {/* School Logo Section */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-900 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-md z-20">Celebrating 5 Years</div>
                    <img 
                      src="https://pfst.cf2.poecdn.net/base/image/bb9d68d08f655fa3db08fb007d258d711165d53ffb7b25c5c6c753dfeb7ce120?w=236&h=290" 
                      alt="Logo" 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <div className="bg-indigo-900 text-white text-[6px] font-black uppercase px-2 py-0.5 mt-[-10px] rounded shadow-sm z-20">OF NURTURING AND TRAINING FOR VICTORY</div>
                </div>

                {/* Title */}
                <div className="flex-1 text-center px-4">
                  <h1 className="text-4xl md:text-5xl font-serif text-teal-600 tracking-tight italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    Certificate of Promotion
                  </h1>
                </div>

                {/* ACE Logo Section */}
                <div className="bg-slate-50/50 p-2 rounded-full w-24 h-24 flex items-center justify-center border border-slate-100">
                  <span className="text-indigo-800 font-serif italic font-black text-3xl">ACE</span>
                </div>
              </div>

              {/* Main Text Content */}
              <div className="text-center space-y-8 md:space-y-12 relative z-10 py-4">
                <p className="text-2xl md:text-3xl font-serif italic text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  This is to certify that <span className="inline-block min-w-[300px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{student.name}</span>
                </p>

                <p className="text-xl md:text-2xl font-serif italic text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  has completed <span className="inline-block min-w-[150px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{student.className}</span> 
                  &nbsp; and has been promoted to <span className="inline-block min-w-[150px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{promotedTo}</span>
                </p>

                <div className="flex flex-wrap justify-center items-end gap-x-8 gap-y-10">
                   <p className="text-xl font-serif italic text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                     on this day <span className="inline-block min-w-[80px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{day}</span>
                   </p>
                   <p className="text-xl font-serif italic text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                     in the month of <span className="inline-block min-w-[150px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{month}</span>
                   </p>
                </div>

                <p className="text-xl font-serif italic text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  of the year <span className="inline-block min-w-[100px] border-b-2 border-teal-500 text-slate-900 px-4 font-black not-italic">{year}</span> .
                </p>

                <div className="pt-8">
                  <h2 className="text-4xl font-serif text-teal-500 italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Congratulations!</h2>
                </div>
              </div>

              {/* Graphics and Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-12 relative z-10 px-4">
                {/* Left Graphics & Teacher */}
                <div className="relative">
                  <div className="absolute -top-32 left-0 pointer-events-none transform -rotate-12 opacity-90">
                    <img 
                      src="https://pfst.cf2.poecdn.net/base/image/6231a3196962f913e64835616f7243c3d55079a4073d88a10b42d131f79f506e?w=200&h=200" 
                      alt="Graduation Cap" 
                      className="w-28"
                      onError={(e) => {
                        (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2997/2997495.png";
                      }}
                    />
                  </div>
                  <div className="mt-20 border-t-2 border-teal-500 pt-2 text-center">
                    <p className="text-xl font-serif text-slate-800 italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Teacher's Signature</p>
                  </div>
                </div>

                {/* Right Graphics & Principal */}
                <div className="relative">
                   <div className="absolute -top-24 right-0 pointer-events-none transform rotate-12 opacity-90">
                    <img 
                      src="https://pfst.cf2.poecdn.net/base/image/9a2b5e28a9b2b5d4e8e9f5e5b5e5b5e5b5e5b5e5b5e5b5e5b5e5b5e5b5e5b5e?w=200&h=200" 
                      alt="Diploma" 
                      className="w-24"
                      onError={(e) => {
                        (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/2997/2997451.png";
                      }}
                    />
                  </div>
                  <div className="mt-20 border-t-2 border-teal-500 pt-2 text-center">
                    <p className="text-xl font-serif text-slate-800 italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Principal's Signature</p>
                  </div>
                </div>
              </div>

              {/* Footer Motto */}
              <div className="text-center mt-12 relative z-10">
                <p className="text-2xl text-teal-500 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Nurturing And Training For Victory
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .certificate-paper { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PromotionCertificate;
