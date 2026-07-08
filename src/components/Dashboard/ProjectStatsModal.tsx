import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, MessageSquare, Eye, Loader2, Calendar } from 'lucide-react';

interface Wish {
  id: string;
  name: string;
  attending: string;
  guests: number;
  message: string;
  created_at: string;
}

interface ProjectStatsModalProps {
  projectId: string;
  projectTitle: string;
  views: number;
  onClose: () => void;
}

export function ProjectStatsModal({ projectId, projectTitle, views, onClose }: ProjectStatsModalProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishes();
  }, [projectId]);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invitations/${projectId}/wishes`);
      const data = await res.json();
      if (data.success) {
        setWishes(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch wishes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalAttending = wishes.filter(w => w.attending === 'hadir').reduce((sum, w) => sum + (w.guests || 1), 0);
  const totalNotAttending = wishes.filter(w => w.attending === 'tidak_hadir').length;
  const totalUnsure = wishes.filter(w => w.attending === 'ragu').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }} onClick={onClose}>
      <div 
        className="w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl animate-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(135deg, #141a2e, #0f1629)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8943A)' }}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Statistik & Ucapan</h2>
              <p className="text-xs text-slate-500 font-medium">{projectTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: views || 0, icon: Eye, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
              { label: 'Total Hadir', value: `${totalAttending} Orang`, icon: Users, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
              { label: 'Tidak Hadir', value: totalNotAttending, icon: X, color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
              { label: 'Total Ucapan', value: wishes.length, icon: MessageSquare, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' }
            ].map(card => (
              <div key={card.label} className="p-5 rounded-2xl flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                    <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                  </div>
                </div>
                <span className="text-2xl font-black text-white">{card.value}</span>
              </div>
            ))}
          </div>

          {/* Wishes List */}
          <div className="rounded-2xl overflow-hidden flex flex-col h-[400px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-5 py-4 flex items-center space-x-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-bold text-white text-sm">Buku Tamu & Ucapan</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  <span className="text-xs font-semibold">Memuat data ucapan...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-rose-400 text-xs font-medium">
                  {error}
                </div>
              ) : wishes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                  <MessageSquare className="w-12 h-12 text-slate-700" />
                  <span className="text-xs font-medium">Belum ada ucapan dari tamu.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishes.map((wish) => (
                    <div key={wish.id} className="p-4 rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{wish.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {wish.attending === 'hadir' && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>Hadir ({wish.guests} Orang)</span>
                            )}
                            {wish.attending === 'tidak_hadir' && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>Tidak Hadir</span>
                            )}
                            {wish.attending === 'ragu' && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>Ragu-ragu</span>
                            )}
                            <span className="flex items-center text-[9px] text-slate-500 font-semibold font-mono">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(wish.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs mt-3 p-3 rounded-xl whitespace-pre-wrap leading-relaxed" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {wish.message || <span className="text-slate-600 italic">Tanpa pesan</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
