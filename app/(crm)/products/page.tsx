'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock_status: 'Available' | 'Out of Stock';
  created_at: string;
}

const CATEGORIES = ['Bracelet', 'Anklet', 'Gemstone', 'Rudraksha', 'Crystal', 'Pendant', 'Ring', 'Other'];

function ProductModal({ product, onClose, onSaved }: { product?: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'Bracelet',
    price: product?.price ?? '',
    description: product?.description ?? '',
    stock_status: product?.stock_status ?? 'Available',
    image_url: product?.image_url ?? '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }));
        setPreview(data.url);
      } else {
        setUploadError(data.error || 'Upload failed. Use URL instead.');
        setShowUrlInput(true);
      }
    } catch {
      setUploadError('Upload failed. Use URL instead.');
      setShowUrlInput(true);
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const method = product ? 'PATCH' : 'POST';
    const url = product ? `/api/products/${product.id}` : '/api/products';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    onSaved();
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Product Image</label>
              <button type="button" onClick={() => setShowUrlInput(v => !v)} className="text-xs text-[#c9a84c] hover:underline">
                {showUrlInput ? 'Upload file instead' : 'Paste image URL instead'}
              </button>
            </div>
            {showUrlInput ? (
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.image_url}
                  onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setPreview(e.target.value); }}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
                />
                {preview && <Image src={preview} alt="preview" width={200} height={200} className="object-contain mx-auto max-h-32 rounded-lg mt-3" unoptimized />}
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#c9a84c]/40 transition-colors"
              >
                {uploading ? (
                  <div className="py-4">
                    <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : preview ? (
                  <div className="relative">
                    <Image src={preview} alt="preview" width={200} height={200} className="object-contain mx-auto max-h-40 rounded-lg" unoptimized />
                    <p className="text-xs text-gray-500 mt-2">Click to change image</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload product image</p>
                    <p className="text-xs text-gray-700 mt-1">PNG, JPG, WebP up to 10MB</p>
                  </div>
                )}
              </div>
            )}
            {uploadError && <p className="text-red-400 text-xs mt-1.5">⚠ {uploadError}</p>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Product Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
                placeholder="e.g. Rose Quartz Bracelet" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
                placeholder="999" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50 resize-none"
                placeholder="Brief product description..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Stock Status</label>
              <select value={form.stock_status} onChange={e => setForm(f => ({ ...f, stock_status: e.target.value as any }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer">
                <option>Available</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.name}
              className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    load();
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = products.filter(p => p.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Products</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">Manage your crystal & spiritual product catalogue</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-xl">
          <p className="text-4xl mb-4">💎</p>
          <p className="text-white font-semibold mb-1">No products yet</p>
          <p className="text-gray-500 text-sm mb-6">Add your first crystal product to the catalogue</p>
          <button onClick={() => setShowModal(true)} className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            Add First Product
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase mb-4">{category}</p>
              <div className="grid grid-cols-4 gap-4">
                {items.map(product => (
                  <div key={product.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-[#c9a84c]/20 transition-colors group">
                    <div className="aspect-square bg-[#111] relative overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl">💎</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${product.stock_status === 'Available' ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'}`}>
                          {product.stock_status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white font-semibold text-sm leading-tight">{product.name}</p>
                      <p className="text-[#c9a84c] font-bold text-sm mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
                      {product.description && <p className="text-gray-600 text-xs mt-1 line-clamp-2">{product.description}</p>}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => { setEditing(product); setShowModal(true); }}
                          className="flex-1 flex items-center justify-center gap-1 border border-white/10 text-gray-400 py-1.5 rounded-lg text-xs hover:border-[#c9a84c]/30 hover:text-[#c9a84c] transition-colors">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setConfirmDelete(product.id)}
                          className="p-1.5 border border-white/10 text-gray-600 rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <p className="text-white font-semibold mb-2">Delete Product?</p>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-white/10 text-gray-400 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => deleteProduct(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && <ProductModal product={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={load} />}
    </div>
  );
}
