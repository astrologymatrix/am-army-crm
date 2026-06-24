'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Shield, Eye, Edit, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: {
    creators: { view: boolean; edit: boolean; delete: boolean };
    products: { view: boolean; edit: boolean; delete: boolean };
    agreements: { view: boolean; edit: boolean; send: boolean };
    pipeline: { view: boolean; edit: boolean };
    team: { view: boolean; edit: boolean };
  };
  status: 'pending' | 'active';
  created_at: string;
}

const SECTIONS = ['creators', 'products', 'agreements', 'pipeline', 'team'] as const;
const SECTION_LABELS: Record<string, string> = {
  creators: 'Creators', products: 'Products', agreements: 'Agreements', pipeline: 'Pipeline', team: 'Team Access',
};
const PERMS_BY_SECTION: Record<string, string[]> = {
  creators: ['view', 'edit', 'delete'],
  products: ['view', 'edit', 'delete'],
  agreements: ['view', 'edit', 'send'],
  pipeline: ['view', 'edit'],
  team: ['view', 'edit'],
};

const DEFAULT_PERMISSIONS = {
  creators: { view: true, edit: false, delete: false },
  products: { view: true, edit: false, delete: false },
  agreements: { view: true, edit: false, send: false },
  pipeline: { view: true, edit: false },
  team: { view: false, edit: false },
};

const ROLE_PRESETS: Record<string, typeof DEFAULT_PERMISSIONS> = {
  admin: {
    creators: { view: true, edit: true, delete: true },
    products: { view: true, edit: true, delete: true },
    agreements: { view: true, edit: true, send: true },
    pipeline: { view: true, edit: true },
    team: { view: true, edit: true },
  },
  editor: {
    creators: { view: true, edit: true, delete: false },
    products: { view: true, edit: true, delete: false },
    agreements: { view: true, edit: true, send: true },
    pipeline: { view: true, edit: true },
    team: { view: false, edit: false },
  },
  viewer: DEFAULT_PERMISSIONS,
};

function AddMemberModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as 'admin' | 'editor' | 'viewer' });
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const applyRole = (role: 'admin' | 'editor' | 'viewer') => {
    setForm(f => ({ ...f, role }));
    setPermissions(ROLE_PRESETS[role] as typeof DEFAULT_PERMISSIONS);
  };

  const togglePerm = (section: string, perm: string) => {
    setPermissions(prev => ({
      ...prev,
      [section]: { ...(prev as any)[section], [perm]: !(prev as any)[section][perm] },
    }));
  };

  const save = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    setError('');
    // Use invite endpoint which sends email
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, permissions }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to invite'); setSaving(false); return; }
    setSent(true);
    onSaved();
    setSaving(false);
  };

  if (sent) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h3 className="text-white font-bold text-lg mb-2">Invite Sent!</h3>
        <p className="text-gray-400 text-sm mb-6">
          An invitation email has been sent to <strong className="text-white">{form.email}</strong>.<br /><br />
          They will receive a link to set their password and access the CRM.
        </p>
        <button onClick={onClose} className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Invite Team Member</h2>
            <p className="text-xs text-gray-500 mt-0.5">They'll receive an email to set their password</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
                placeholder="Team member name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
                placeholder="email@example.com" />
            </div>
          </div>

          {/* Role presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Role</label>
            <div className="grid grid-cols-3 gap-3">
              {(['admin', 'editor', 'viewer'] as const).map(role => (
                <button key={role} onClick={() => applyRole(role)}
                  className={`p-3 rounded-xl border text-left transition-all ${form.role === role ? 'border-[#c9a84c]/50 bg-[#c9a84c]/10' : 'border-white/10 hover:border-white/20'}`}>
                  <p className={`text-sm font-semibold capitalize ${form.role === role ? 'text-[#c9a84c]' : 'text-white'}`}>{role}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {role === 'admin' ? 'Full access to everything' : role === 'editor' ? 'Edit but cannot delete or manage team' : 'View-only access'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions matrix */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Custom Permissions</label>
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Section</th>
                    {['View', 'Edit', 'Delete / Send'].map(h => (
                      <th key={h} className="px-4 py-3 text-center text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SECTIONS.map(section => (
                    <tr key={section} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-gray-300 font-medium">{SECTION_LABELS[section]}</td>
                      {['view', 'edit', PERMS_BY_SECTION[section][2] ?? null].map((perm, pi) => (
                        <td key={pi} className="px-4 py-3 text-center">
                          {perm && PERMS_BY_SECTION[section].includes(perm) ? (
                            <input type="checkbox"
                              checked={(permissions as any)[section][perm] ?? false}
                              onChange={() => togglePerm(section, perm)}
                              className="w-4 h-4 accent-[#c9a84c] cursor-pointer" />
                          ) : <span className="text-gray-700">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && <div className="bg-red-900/30 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.name || !form.email}
              className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Sending Invite...' : '✉ Send Invite Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/team');
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteMember = async (id: string) => {
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    load();
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30',
    editor: 'bg-blue-900/30 text-blue-400 border-blue-800/30',
    viewer: 'bg-gray-800/40 text-gray-400 border-gray-700/30',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Team Access</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">Manage who can access and edit each section of the CRM</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Admin card */}
      <div className="bg-[#1a1a1a] border border-[#c9a84c]/20 rounded-xl p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#c9a84c]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Yachika Verma <span className="text-[11px] font-normal text-[#c9a84c] ml-1">(You)</span></p>
          <p className="text-gray-500 text-xs">onboarding@astrologymatrix.in</p>
        </div>
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30">Admin</span>
        <span className="text-xs text-green-400">● Active</span>
      </div>

      {/* Team members */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase">Team Members</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">No team members added yet.</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 text-[#c9a84c] text-sm hover:underline">Add your first team member →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Email', 'Role', 'Permissions', 'Status', 'Added', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 text-white font-medium">{m.name}</td>
                  <td className="px-5 py-4 text-gray-400">{m.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${ROLE_COLORS[m.role]}`}>{m.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {SECTIONS.filter(s => m.permissions?.[s]?.view).map(s => (
                        <span key={s} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">{SECTION_LABELS[s]}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs ${m.status === 'active' ? 'text-green-400' : 'text-orange-400'}`}>
                      {m.status === 'active' ? '● Active' : '○ Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">
                    {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setConfirmDelete(m.id)}
                      className="p-1.5 border border-white/10 text-gray-600 rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Permission legend */}
      <div className="mt-6 bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
        <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase mb-4">Role Permissions Overview</p>
        <div className="grid grid-cols-3 gap-4">
          {(['admin', 'editor', 'viewer'] as const).map(role => (
            <div key={role} className="bg-[#111] rounded-xl p-4 border border-white/5">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize mb-3 ${ROLE_COLORS[role]}`}>{role}</span>
              <ul className="space-y-1.5 text-xs text-gray-500">
                {role === 'admin' && <>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Full access to all sections</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Add/edit/delete creators</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Send agreements</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Manage team access</li>
                </>}
                {role === 'editor' && <>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> View all sections</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Edit creators & products</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Send agreements</li>
                  <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Cannot manage team</li>
                </>}
                {role === 'viewer' && <>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> View creators & pipeline</li>
                  <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> View products</li>
                  <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Cannot edit anything</li>
                  <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Cannot send agreements</li>
                </>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <p className="text-white font-semibold mb-2">Remove Team Member?</p>
            <p className="text-gray-500 text-sm mb-5">They will lose access to the CRM immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-white/10 text-gray-400 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => deleteMember(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onSaved={load} />}
    </div>
  );
}
