'use client';

import { useState, useEffect } from 'react';
import { CreateInfluencerInput } from '@/types';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

interface DBProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Default products always available
const DEFAULT_PRODUCTS = ['Rose Quartz Bracelet', 'Pyrite Anklet'];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent placeholder-gray-400';

export default function AddInfluencerModal({ onClose, onAdded }: Props) {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [form, setForm] = useState<CreateInfluencerInput & { product_custom?: string }>({
    full_name: '',
    phone: '',
    email: '',
    instagram_handle: '',
    followers: 0,
    address: '',
    product_assigned: 'Pyrite Anklet',
    payment_amount: 900,
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setDbProducts(Array.isArray(d) ? d : []));
  }, []);

  const allProducts = [
    ...DEFAULT_PRODUCTS,
    ...dbProducts.map(p => p.name).filter(n => !DEFAULT_PRODUCTS.includes(n)),
  ];

  const set = (field: string, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      onAdded();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add influencer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal — force light theme with text-gray-900 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Creator</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in details to onboard a new AM Army creator</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                className={inputCls} placeholder="e.g. Juhi Nayak" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                className={inputCls} placeholder="9999999999" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={inputCls} placeholder="creator@gmail.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle *</label>
              <div className="flex">
                <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg px-3 py-2 text-sm text-gray-500">@</span>
                <input required value={form.instagram_handle.replace('@', '')}
                  onChange={e => set('instagram_handle', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  placeholder="username" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Followers</label>
              <input type="number" value={form.followers || ''} onChange={e => set('followers', parseInt(e.target.value) || 0)}
                className={inputCls} placeholder="5000" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <textarea required rows={3} value={form.address} onChange={e => set('address', e.target.value)}
                className={inputCls + ' resize-none'} placeholder="House No., Street, Area, City, State, PIN" />
            </div>

            {/* Product selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Assigned *</label>
              <div className="grid grid-cols-2 gap-2">
                {allProducts.map(p => (
                  <label key={p} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.product_assigned === p ? 'border-[#c9a84c] bg-[#fdf8ee]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="product" value={p} checked={form.product_assigned === p}
                      onChange={() => set('product_assigned', p)} className="accent-[#c9a84c]" />
                    <span className="text-sm font-medium text-gray-800">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cash Compensation (₹) *</label>
              <div className="flex gap-3">
                {[900, 1000].map(amt => (
                  <label key={amt} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all flex-1 ${form.payment_amount === amt ? 'border-[#c9a84c] bg-[#fdf8ee]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={amt} checked={form.payment_amount === amt}
                      onChange={() => set('payment_amount', amt)} className="accent-[#c9a84c]" />
                    <span className="text-sm font-medium text-gray-800">₹{amt.toLocaleString('en-IN')}</span>
                  </label>
                ))}
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600">Custom:</span>
                  <input type="number" placeholder="₹ amount"
                    value={[900, 1000].includes(form.payment_amount) ? '' : form.payment_amount}
                    onChange={e => set('payment_amount', parseInt(e.target.value) || 900)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Notes</label>
              <input value={form.remarks || ''} onChange={e => set('remarks', e.target.value)}
                className={inputCls} placeholder="Any notes..." />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'Adding...' : 'Add Creator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
