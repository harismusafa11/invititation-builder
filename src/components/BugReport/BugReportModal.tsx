import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface BugReportModalProps {
  userEmail?: string;
  userId?: string;
  onClose: () => void;
}

export default function BugReportModal({ userEmail = '', userId = '', onClose }: BugReportModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Deskripsi kendala wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          description: description,
          page_url: window.location.href,
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(data.error || 'Gagal mengirim laporan bug.');
      }
    } catch (err: any) {
      console.error('Error submitting bug report:', err);
      setErrorMsg('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Laporkan Bug / Kendala</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Bantu kami meningkatkan platform ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Laporan Berhasil Terkirim!</h4>
              <p className="text-[11px] text-slate-450 leading-relaxed max-w-xs mx-auto">
                Terima kasih atas kontribusi Anda. Tim kami akan segera meninjau dan memperbaiki kendala ini secepatnya.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Anda
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Deskripsi Bug / Kendala
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan kendala yang Anda alami secara detail (misal: tombol edit tidak merespon saat diklik, dll)"
                rows={4}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-amber-500 transition-all resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-white font-bold text-xs tracking-wider rounded-xl shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
