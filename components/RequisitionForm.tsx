
import React, { useState } from 'react';
import { User, Requisition } from '../types';

interface RequisitionFormProps {
  user: User;
  onSubmit: (req: Requisition) => void;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ user, onSubmit }) => {
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [justification, setJustification] = useState('');

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: Requisition = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      date: new Date().toLocaleDateString('en-GB'),
      items,
      totalAmount,
      justification,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    onSubmit(req);
    alert("Requisition submitted successfully!");
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl border border-slate-100 max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Requisition Form</h2>
        <div className="h-1 w-20 bg-teal-600 mx-auto rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
             <h3 className="font-black text-indigo-900 uppercase text-sm tracking-widest">Required Items</h3>
             <button type="button" onClick={addItem} className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-4 py-1 rounded-full">+ Add Item</button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-2xl relative group">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Description</label>
                  <input required className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Qty</label>
                  <input type="number" required className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Price</label>
                  <input type="number" required className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Total</label>
                  <div className="w-full p-3 bg-slate-100 border border-transparent rounded-xl font-black text-slate-600">{item.total.toLocaleString()}</div>
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end p-6 bg-indigo-900 rounded-[32px] shadow-xl text-white">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-60">Total Estimated Amount</p>
                <p className="text-3xl font-black">{totalAmount.toLocaleString()} <span className="text-xs">UGX</span></p>
             </div>
          </div>
        </div>

        <section className="space-y-6">
          <h3 className="font-black text-indigo-900 uppercase text-sm tracking-widest border-b pb-2">Justification / Purpose</h3>
          <textarea required className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[32px] font-medium outline-none min-h-[120px]" placeholder="Explain why these items are necessary for school operations..." value={justification} onChange={e => setJustification(e.target.value)} />
        </section>

        <button type="submit" className="w-full bg-indigo-900 text-white font-black py-5 rounded-3xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest">Submit Requisition</button>
      </form>
    </div>
  );
};

export default RequisitionForm;
