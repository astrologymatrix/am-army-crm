'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';
import { ChevronLeft, ChevronRight, Send, CalendarDays, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseYMD(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function SchedulePage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Scheduling panel
  const [panelInfluencer, setPanelInfluencer] = useState<Influencer | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  // Filter
  const [filter, setFilter] = useState<'pending' | 'scheduled' | 'all'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Creators who submitted video for review (video_status = 'Sent') — ready to schedule
  const readyToSchedule = influencers.filter(i => i.video_status === 'Sent' && !i.video_scheduled_date);
  const scheduled = influencers.filter(i => i.video_scheduled_date);
  const allRelevant = influencers.filter(i => i.video_status === 'Sent' || i.video_scheduled_date);

  const listMap: Record<string, Influencer[]> = {
    pending: readyToSchedule,
    scheduled,
    all: allRelevant,
  };
  const listItems = listMap[filter];

  // Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map scheduled date → creators
  const scheduleMap: Record<string, Influencer[]> = {};
  scheduled.forEach(inf => {
    const d = inf.video_scheduled_date!.slice(0, 10);
    if (!scheduleMap[d]) scheduleMap[d] = [];
    scheduleMap[d].push(inf);
  });

  const today = toYMD(new Date());

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDateClick = (ymd: string) => {
    setSelectedDate(ymd);
    setFeedback(null);
  };

  const assignAndNotify = async () => {
    if (!panelInfluencer || !selectedDate) return;
    setSending(true);
    setFeedback(null);
    const res = await fetch('/api/send-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerId: panelInfluencer.id, scheduledDate: selectedDate, note }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ msg: `Scheduled & email sent to ${panelInfluencer.full_name}!`, ok: true });
      setPanelInfluencer(null);
      setNote('');
      setSelectedDate(null);
      load();
    } else {
      setFeedback({ msg: data.error || 'Something went wrong', ok: false });
    }
    setSending(false);
  };

  const unschedule = async (inf: Influencer) => {
    const res = await fetch(`/api/influencers/${inf.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_scheduled_date: null, schedule_notified_at: null }),
    });
    if (res.ok) {
      setFeedback({ msg: `Removed schedule for ${inf.full_name}.`, ok: true });
      load();
    } else {
      setFeedback({ msg: 'Failed to remove schedule', ok: false });
    }
  };

  const saveDateOnly = async () => {
    if (!panelInfluencer || !selectedDate) return;
    setSending(true);
    setFeedback(null);
    const res = await fetch(`/api/influencers/${panelInfluencer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_scheduled_date: selectedDate }),
    });
    if (res.ok) {
      setFeedback({ msg: `Date saved for ${panelInfluencer.full_name}. No email sent.`, ok: true });
      setPanelInfluencer(null);
      setNote('');
      setSelectedDate(null);
      load();
    } else {
      setFeedback({ msg: 'Failed to save date', ok: false });
    }
    setSending(false);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Build calendar cells
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Video Schedule</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">Plan & notify creators when to post their videos</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" /> {readyToSchedule.length} awaiting schedule</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> {scheduled.length} scheduled</span>
        </div>
      </div>

      {feedback && (
        <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${feedback.ok ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-[1fr_340px] gap-6">

        {/* ── Calendar ── */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-white">{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((ymd, i) => {
              if (!ymd) return <div key={`empty-${i}`} />;
              const isToday = ymd === today;
              const isSelected = ymd === selectedDate;
              const creators = scheduleMap[ymd] || [];
              const hasConflict = creators.length > 1;
              const isPast = ymd < today;

              return (
                <button
                  key={ymd}
                  onClick={() => handleDateClick(ymd)}
                  className={`relative min-h-[72px] rounded-xl p-1.5 text-left transition-all border ${
                    isSelected
                      ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                      : isToday
                      ? 'border-blue-500/40 bg-blue-500/5'
                      : isPast
                      ? 'border-transparent bg-white/2 opacity-50'
                      : 'border-transparent bg-white/3 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span className={`text-xs font-semibold block mb-1 ${isToday ? 'text-blue-400' : isSelected ? 'text-[#c9a84c]' : 'text-gray-400'}`}>
                    {Number(ymd.slice(8))}
                  </span>
                  {hasConflict && (
                    <span className="absolute top-1 right-1">
                      <AlertTriangle className="w-3 h-3 text-orange-400" />
                    </span>
                  )}
                  <div className="space-y-0.5">
                    {creators.slice(0, 2).map(inf => (
                      <div key={inf.id}
                        className="text-[9px] leading-tight px-1 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] font-medium truncate">
                        {inf.full_name.split(' ')[0]}
                      </div>
                    ))}
                    {creators.length > 2 && (
                      <div className="text-[9px] text-gray-500 px-1">+{creators.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#c9a84c]/20 inline-block border border-[#c9a84c]/40" /> Scheduled</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-orange-400" /> Same-day conflict</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500/20 inline-block border border-blue-500/40" /> Today</span>
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="space-y-4">

          {/* Selected date summary */}
          {selectedDate && (
            <div className="bg-[#1a1a1a] border border-[#c9a84c]/30 rounded-2xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Selected Date</p>
              <p className="text-white font-bold text-sm">{fmt(selectedDate)}</p>
              {scheduleMap[selectedDate]?.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {scheduleMap[selectedDate].map(inf => (
                    <div key={inf.id} className="flex items-center gap-2 text-xs bg-[#111] border border-white/5 rounded-lg px-2.5 py-1.5">
                      <CalendarDays className="w-3 h-3 text-[#c9a84c] flex-shrink-0" />
                      <span className="text-[#c9a84c] flex-1 truncate">{inf.full_name}</span>
                      {inf.schedule_notified_at && <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                      <button
                        onClick={() => unschedule(inf)}
                        title="Remove from schedule"
                        className="ml-1 p-0.5 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {scheduleMap[selectedDate].length > 1 && (
                    <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Multiple creators on same day
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Schedule a creator */}
          {selectedDate && (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Assign a Creator</p>
              <select
                value={panelInfluencer?.id || ''}
                onChange={e => {
                  const inf = readyToSchedule.find(i => i.id === e.target.value) || null;
                  setPanelInfluencer(inf);
                }}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer"
              >
                <option value="">— Pick a creator —</option>
                {readyToSchedule.map(inf => (
                  <option key={inf.id} value={inf.id}>{inf.full_name} (@{inf.instagram_handle})</option>
                ))}
              </select>

              {panelInfluencer && (
                <>
                  <div className="bg-[#111] border border-white/5 rounded-xl p-3 text-xs space-y-1">
                    <p className="text-gray-400">Product: <span className="text-white">{panelInfluencer.product_assigned}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{panelInfluencer.email}</span></p>
                    <p className="text-gray-400">Followers: <span className="text-white">{Number(panelInfluencer.followers || 0).toLocaleString('en-IN')}</span></p>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Note to Creator <span className="normal-case text-gray-600">(optional)</span></label>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Please post between 6–9pm for best reach"
                      rows={3}
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={assignAndNotify}
                      disabled={sending}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Sending…' : 'Save & Notify'}
                    </button>
                    <button
                      onClick={saveDateOnly}
                      disabled={sending}
                      title="Save date without sending email"
                      className="px-3 py-2.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl text-sm transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 text-center">Clock icon = save date only, no email</p>
                </>
              )}
            </div>
          )}

          {!selectedDate && (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 text-center">
              <CalendarDays className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Click a date on the calendar to assign a creator</p>
            </div>
          )}

          {/* Creator list */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex-1">Creators</p>
              <div className="flex bg-[#111] rounded-lg p-0.5">
                {(['pending', 'scheduled', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase transition-colors ${filter === f ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-gray-600 hover:text-gray-400'}`}>
                    {f === 'pending' ? `Pending (${readyToSchedule.length})` : f === 'scheduled' ? `Scheduled (${scheduled.length})` : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : listItems.length === 0 ? (
              <p className="text-gray-700 text-xs text-center py-4">
                {filter === 'pending' ? 'No creators waiting to be scheduled' : 'None yet'}
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                {listItems.map(inf => {
                  const isNotified = !!inf.schedule_notified_at;
                  const hasDate = !!inf.video_scheduled_date;
                  return (
                    <div key={inf.id}
                      className={`rounded-xl border p-3 transition-colors ${hasDate ? 'border-[#c9a84c]/20 bg-[#c9a84c]/5' : 'border-white/5 bg-[#111]'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { if (hasDate) setSelectedDate(inf.video_scheduled_date!.slice(0, 10)); }}>
                          <p className="text-white text-xs font-semibold truncate">{inf.full_name}</p>
                          <p className="text-gray-600 text-[10px] truncate">@{inf.instagram_handle}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isNotified && <span className="flex items-center gap-0.5 text-[9px] text-emerald-400"><CheckCircle className="w-2.5 h-2.5" /> Notified</span>}
                          {hasDate && !isNotified && <span className="flex items-center gap-0.5 text-[9px] text-[#c9a84c]"><Clock className="w-2.5 h-2.5" /> Saved</span>}
                          {!hasDate && <span className="text-[9px] text-orange-400 font-semibold">Pending</span>}
                          {hasDate && (
                            <button
                              onClick={() => unschedule(inf)}
                              title="Remove schedule"
                              className="p-0.5 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {hasDate && (
                        <p className="text-[10px] text-[#c9a84c] mt-1.5 cursor-pointer" onClick={() => setSelectedDate(inf.video_scheduled_date!.slice(0, 10))}>
                          📅 {fmt(inf.video_scheduled_date!)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
