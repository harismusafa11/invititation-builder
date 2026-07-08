import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Copy, Check, Send, AlertCircle, Users, User, 
  Trash2, Download, Plus, FileText 
} from 'lucide-react';

interface ShareModalProps {
  projectTitle: string;
  projectSlug: string;
  onClose: () => void;
}

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'sent' | 'read';
}

export function ShareModal({ projectTitle, projectSlug, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [useTemplateMessage, setUseTemplateMessage] = useState(true);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const confirmTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);
  
  const [template, setTemplate] = useState(
    `Selamat Pagi/Siang/Sore,
Salam Sejahtera untuk kita semua.

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk menjadi bagian dari momen bahagia kami dan menghadiri upacara serta resepsi pernikahan kami.

Detail lengkap informasi acara, penunjuk lokasi map, dan RSVP dapat diakses melalui tautan undangan digital berikut:
{tautan_undangan}

Merupakan suatu kehormatan dan kebahagiaan yang mendalam bagi kami apabila Bapak/Ibu/Saudara/i berkenan meluangkan waktu untuk hadir dan memberikan doa restu secara langsung pada hari istimewa kami.

Atas kehadiran dan doa restunya, kami mengucapkan terima kasih yang setulus-tulusnya.`
  );

  // Load guests list from database API on mount
  useEffect(() => {
    fetch(`/api/invitations/${projectSlug}/guests`)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setGuests(result.data);
        }
      })
      .catch(err => console.error("Failed to load guests from server:", err));
  }, [projectSlug]);

  const baseUrl = `${window.location.origin}/v/${projectSlug}`;

  const getGuestUrl = (name: string) => {
    const clean = name.trim();
    return clean ? `${baseUrl}?to=${encodeURIComponent(clean)}` : baseUrl;
  };

  const getGuestMessage = (name: string) => {
    const url = getGuestUrl(name);
    if (!useTemplateMessage) return url;
    return template
      .replace(/{nama_tamu}/g, name.trim() || 'Tamu Undangan')
      .replace(/{tautan_undangan}/g, url);
  };

  const singleInvitationUrl = guestName.trim()
    ? `${baseUrl}?to=${encodeURIComponent(guestName.trim())}`
    : baseUrl;

  const singleFinalMessage = useTemplateMessage
    ? template
        .replace(/{nama_tamu}/g, guestName.trim() || 'Tamu Undangan')
        .replace(/{tautan_undangan}/g, singleInvitationUrl)
    : singleInvitationUrl;

  const saveSingleGuestToDb = async (name: string, status: 'pending' | 'sent' | 'read' = 'pending') => {
    const exists = guests.find(g => g.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      if (exists.status === 'pending') {
        try {
          await fetch(`/api/invitations/${projectSlug}/guests/${exists.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          setGuests(prev => prev.map(g => g.id === exists.id ? { ...g, status } : g));
        } catch (e) {
          console.error("Failed to update guest status on share:", e);
        }
      }
      return;
    }

    try {
      const res = await fetch(`/api/invitations/${projectSlug}/guests/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: [{ name }] })
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const added = result.data[0];
        if (status !== 'pending' && added) {
          await fetch(`/api/invitations/${projectSlug}/guests/${added.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          added.status = status;
        }
        setGuests(prev => [added, ...prev]);
      }
    } catch (err) {
      console.error("Failed to auto-save single guest to DB:", err);
    }
  };

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(singleFinalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (guestName.trim()) {
      await saveSingleGuestToDb(guestName.trim(), 'sent');
    }
  };

  const handleShareWhatsApp = async () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(singleFinalMessage)}`;
    window.open(waUrl, '_blank');
    if (guestName.trim()) {
      await saveSingleGuestToDb(guestName.trim(), 'sent');
    }
  };

  const handleAddBulkGuests = async () => {
    if (!bulkInput.trim()) return;
    const names = bulkInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const payload = {
      guests: names.map(name => ({ name }))
    };

    try {
      const res = await fetch(`/api/invitations/${projectSlug}/guests/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setGuests(prev => [...result.data, ...prev]);
        setBulkInput('');
      } else {
        alert('Gagal menambah tamu: ' + (result.error || 'Server error'));
      }
    } catch (err) {
      console.error("Bulk add error:", err);
      alert('Gagal menambah tamu ke database.');
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${projectSlug}/guests/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setGuests(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete guest from DB:", err);
    }
  };

  const handleClearAllGuests = async () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setIsConfirmingClear(false);
      }, 3000);
      return;
    }

    setIsConfirmingClear(false);
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);

    try {
      const res = await fetch(`/api/invitations/${projectSlug}/guests`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setGuests([]);
      }
    } catch (err) {
      console.error("Failed to clear guests list from DB:", err);
    }
  };

  const handleCopyGuestLink = async (guest: Guest) => {
    const msg = getGuestMessage(guest.name);
    navigator.clipboard.writeText(msg);
    
    // Update status to 'sent' in database
    try {
      await fetch(`/api/invitations/${projectSlug}/guests/${guest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' })
      });
      
      setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, status: 'sent' } : g));
    } catch (e) {
      console.error("Failed to update guest status on copy link:", e);
    }

    setCopiedGuestId(guest.id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

  const handleShareWhatsAppGuest = async (guest: Guest) => {
    const msg = getGuestMessage(guest.name);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    // Update status to 'sent' in database
    try {
      await fetch(`/api/invitations/${projectSlug}/guests/${guest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' })
      });

      setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, status: 'sent' } : g));
    } catch (e) {
      console.error("Failed to update guest status on wa share:", e);
    }
  };

  const handleToggleStatus = async (guest: Guest) => {
    const nextStatus = guest.status === 'pending' ? 'sent' : guest.status === 'sent' ? 'read' : 'pending';
    try {
      await fetch(`/api/invitations/${projectSlug}/guests/${guest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, status: nextStatus } : g));
    } catch (e) {
      console.error("Failed to toggle status in DB:", e);
    }
  };

  const handleExportGuests = () => {
    if (guests.length === 0) return;
    const lines = guests.map(g => `${g.name}: ${getGuestUrl(g.name)}`);
    const fileContent = lines.join('\n');
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daftar-tamu-${projectSlug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyPreset = (type: 'formal' | 'islam' | 'kristen' | 'hindu' | 'buddha' | 'casual' | 'english') => {
    if (type === 'formal') {
      setTemplate(
        `Selamat Pagi/Siang/Sore,\nSalam Sejahtera untuk kita semua.\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk menjadi bagian dari momen bahagia kami dan menghadiri upacara serta resepsi pernikahan kami.\n\nDetail lengkap informasi acara, penunjuk lokasi map, dan RSVP dapat diakses melalui tautan undangan digital berikut:\n{tautan_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan yang mendalam bagi kami apabila Bapak/Ibu/Saudara/i berkenan meluangkan waktu untuk hadir dan memberikan doa restu secara langsung pada hari istimewa kami.\n\nAtas kehadiran dan doa restunya, kami mengucapkan terima kasih yang setulus-tulusnya.`
      );
    } else if (type === 'islam') {
      setTemplate(
        `Assalamu'alaikum Wr. Wb.\n\nMaha Suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah, perkenankanlah kami merajut kasih suci dalam ikatan pernikahan.\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk menjadi bagian dari momen bersejarah serta memberikan doa restu pada pernikahan kami.\n\nDetail informasi acara, lokasi, dan RSVP dapat diakses melalui tautan undangan digital berikut:\n{tautan_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan yang sangat besar bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu secara langsung untuk mengiringi langkah baru kehidupan kami.\n\nAtas kehadiran dan doa restunya, kami mengucapkan terima kasih yang sebesar-besarnya.\n\nWassalamu'alaikum Wr. Wb.`
      );
    } else if (type === 'kristen') {
      setTemplate(
        `Syalom, Salam Sejahtera dalam kasih Tuhan Yesus Kristus.\n\nAtas kasih karunia Tuhan yang melimpah, Dia mempersatukan kami dalam ikatan pernikahan kudus.\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk menghadiri ibadah pemberkatan dan resepsi pernikahan kami.\n\nDetail informasi acara, lokasi map, dan RSVP dapat diakses melalui tautan undangan digital berikut:\n{tautan_undangan}\n\nKehadiran serta doa restu Bapak/Ibu/Saudara/i merupakan karunia yang terindah bagi kami dalam memulai babak baru kehidupan keluarga ini.\n\nAtas perhatian, doa restu, dan kehadiran Bapak/Ibu/Saudara/i, kami mengucapkan terima kasih. Tuhan Yesus memberkati.`
      );
    } else if (type === 'hindu') {
      setTemplate(
        `Om Swastyastu.\n\nAtas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa/Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan upacara Pawiwahan (Pernikahan) kami.\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk ikut serta menyaksikan kesucian janji suci kami serta memberikan doa restu.\n\nInformasi lengkap mengenai jadwal upacara, peta lokasi, dan RSVP dapat dilihat melalui tautan undangan digital di bawah ini:\n{tautan_undangan}\n\nKehadiran serta doa restu dari Bapak/Ibu/Saudara/i sangat berarti bagi kami dalam mengawali lembaran hidup baru ini.\n\nAtas perhatian dan kehadirannya, kami mengucapkan terima kasih yang setulus-tulusnya.\n\nOm Shanti, Shanti, Shanti Om.`
      );
    } else if (type === 'buddha') {
      setTemplate(
        `Namo Buddhaya.\n\nTerpujilah Sang Bagawan, Yang Maha Esa, Yang Maha Suci, Yang Telah Mencapai Penerangan Sempurna.\n\nDalam suasana penuh berkah, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama_tamu}* untuk menghadiri upacara pernikahan suci kami dan berbagi kebahagiaan bersama kami.\n\nDetail lengkap acara, peta penunjuk arah, serta RSVP dapat Anda akses melalui tautan undangan digital berikut:\n{tautan_undangan}\n\nKehadiran serta doa restu (metta) dari Bapak/Ibu/Saudara/i merupakan berkah yang amat besar bagi kami dalam menjalani kehidupan berumah tangga.\n\nSemoga semua makhluk hidup berbahagia. Sabbe Satta Bhavantu Sukhitatta. Sadhu, Sadhu, Sadhu.`
      );
    } else if (type === 'casual') {
      setTemplate(
        `Halo *{nama_tamu}*! 🎉\n\nKabar bahagia! Dengan penuh rasa syukur, kami ingin mengundang kamu untuk hadir di hari pernikahan kami. Momen istimewa ini tidak akan lengkap tanpa kehadiran teman-teman terdekat.\n\nYuk, intip detail acara, peta lokasi, galeri foto, dan konfirmasi kehadiran kamu (RSVP) melalui link undangan digital di bawah ini:\n{tautan_undangan}\n\nKehadiran dan doa restu kamu sangat berarti buat kami dalam memulai petualangan hidup yang baru ini. Ditunggu kedatangannya ya! Terima kasih banyak! 😊`
      );
    } else if (type === 'english') {
      setTemplate(
        `Dear *{nama_tamu}*,\n\nWith joyful hearts, we cordially invite you to celebrate our wedding day and share in our joy.\n\nKindly view the wedding details, location map, and RSVP via our digital invitation link:\n{tautan_undangan}\n\nYour presence and blessings on our wedding day would mean the world to us as we begin our new life journey together.\n\nThank you very much, and we look forward to celebrating with you.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden rounded-3xl animate-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(135deg, #141a2e, #0f1629)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8943A)' }}>
              <Send className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Bagikan Undangan</h2>
              <p className="text-[10px] text-slate-400 font-medium">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex border-b border-white/5 bg-white/2">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'single'
                ? 'border-[#D4AF37] text-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Bagikan Satu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bulk'
                ? 'border-[#D4AF37] text-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Tamu ({guests.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: SINGLE SHARE */}
          {activeTab === 'single' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Guest Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nama Tamu Undangan
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Contoh: Kenzo Alfarezel / Keluarga Wijaya"
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl outline-none transition-all text-white placeholder:text-slate-600 focus:border-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  autoFocus
                />
                <p className="text-[9px] text-slate-450 leading-relaxed">
                  Nama ini akan tercetak otomatis di halaman sampul undangan saat tautan dibuka oleh tamu.
                </p>
              </div>

              {/* Generated Link Preview */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tautan Undangan Terpersonalisasi
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex-1 py-3 px-4 overflow-hidden flex items-center">
                    <p className="text-[10px] font-mono font-bold text-[#D4AF37] truncate">{singleInvitationUrl}</p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`py-3 px-4 flex items-center justify-center space-x-1.5 text-[10px] font-bold transition-all cursor-pointer shrink-0 ${copied
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5" /><span>Tersalin!</span></>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /><span>Salin</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BULK GUEST LIST MANAGER */}
          {activeTab === 'bulk' && (
            <div className="space-y-4 animate-in fade-in duration-200 flex flex-col h-full">
              {/* Import Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Impor Nama Tamu Sekaligus (Satu Nama Per Baris)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    placeholder={`Contoh:\nKenzo Alfarezel\nKeluarga Wijaya\nRobert & Partner`}
                    rows={3}
                    className="flex-1 text-xs rounded-xl p-3 outline-none font-sans text-slate-200 leading-relaxed resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBulkGuests}
                    disabled={!bulkInput.trim()}
                    className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Guest Actions Bar */}
              {guests.length > 0 && (
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-semibold">Total: {guests.length} Tamu</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      {guests.filter(g => g.status === 'sent').length} Terkirim
                    </span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                      {guests.filter(g => g.status === 'read').length} Dibaca
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportGuests}
                      className="px-2.5 py-1 text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      title="Unduh daftar link undangan dalam file teks"
                    >
                      <Download className="w-3 h-3" />
                      <span>Ekspor List</span>
                    </button>
                    <button
                      onClick={handleClearAllGuests}
                      className={`px-2.5 py-1 text-[9px] font-bold border rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        isConfirmingClear
                          ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isConfirmingClear ? 'Yakin Hapus Semua?' : 'Hapus Semua'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Guest List Grid */}
              <div className="flex-1 min-h-[180px] max-h-[300px] overflow-y-auto pr-1">
                {guests.length > 0 ? (
                  <div className="space-y-2">
                    {guests.map((g) => {
                      const guestUrl = getGuestUrl(g.name);
                      const isCopied = copiedGuestId === g.id;
                      const isSent = g.status === 'sent';
                      const isRead = g.status === 'read';

                      let rowBg = 'rgba(255,255,255,0.02)';
                      let rowBorder = '1px solid rgba(255,255,255,0.05)';
                      if (isSent) {
                        rowBg = 'rgba(16,185,129,0.03)';
                        rowBorder = '1px solid rgba(16,185,129,0.1)';
                      } else if (isRead) {
                        rowBg = 'rgba(59,130,246,0.04)';
                        rowBorder = '1px solid rgba(59,130,246,0.12)';
                      }

                      let badgeText = 'Belum Kirim';
                      let badgeClass = 'bg-slate-800 text-slate-400 hover:bg-slate-700';
                      if (isSent) {
                        badgeText = 'Terkirim';
                        badgeClass = 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
                      } else if (isRead) {
                        badgeText = 'Dibaca';
                        badgeClass = 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20';
                      }

                      const renderCheckmarks = (status: 'pending' | 'sent' | 'read') => {
                        if (status === 'pending') {
                          return <span className="text-slate-500 text-[11px] font-sans ml-1.5 select-none" title="Belum Dikirim">✓</span>;
                        }
                        if (status === 'sent') {
                          return <span className="text-slate-400 text-[11px] font-sans ml-1.5 select-none" title="Terkirim (Belum Dibaca)">✓✓</span>;
                        }
                        if (status === 'read') {
                          return <span className="text-sky-400 text-[11px] font-sans ml-1.5 select-none font-bold" title="Dibaca">✓✓</span>;
                        }
                        return null;
                      };

                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-3 rounded-xl transition-all"
                          style={{ 
                            background: rowBg, 
                            border: rowBorder 
                          }}
                        >
                          {/* Name & URL */}
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${isRead ? 'text-blue-400' : isSent ? 'text-emerald-400' : 'text-white'} truncate`}>
                                {g.name}
                              </span>
                              {renderCheckmarks(g.status)}
                              <button
                                onClick={() => handleToggleStatus(g)}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded-md cursor-pointer select-none ${badgeClass}`}
                              >
                                {badgeText}
                              </button>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5">
                              {guestUrl}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyGuestLink(g)}
                              className={`p-2 rounded-lg transition-all cursor-pointer ${
                                isCopied 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                              }`}
                              title="Salin Pesan Undangan Lengkap"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            
                            <button
                              onClick={() => handleShareWhatsAppGuest(g)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              title="Kirim via WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteGuest(g.id)}
                              className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 opacity-25" />
                    <p className="text-xs font-semibold">Belum ada tamu</p>
                    <p className="text-[10px] text-slate-650 max-w-xs leading-relaxed">Impor daftar nama tamu di atas untuk mulai membuat tautan undangan personal dalam jumlah banyak.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template Presets + Textarea */}
          <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Teks Pesan WhatsApp
                </label>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setUseTemplateMessage(v => !v)}
                  className={`relative inline-flex items-center w-9 h-5 rounded-full transition-all cursor-pointer shrink-0 ${
                    useTemplateMessage ? 'bg-[#D4AF37]' : 'bg-slate-700'
                  }`}
                  title={useTemplateMessage ? 'Matikan template pesan' : 'Aktifkan template pesan'}
                  aria-checked={useTemplateMessage}
                  role="switch"
                >
                  <span
                    className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-200 ${
                      useTemplateMessage ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className={`text-[9px] font-bold ${
                  useTemplateMessage ? 'text-[#D4AF37]' : 'text-slate-600'
                }`}>
                  {useTemplateMessage ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {useTemplateMessage && (
                <div className="flex flex-wrap gap-1 md:gap-1.5 justify-end max-w-[60%]">
                  {([
                    { id: 'formal', label: 'Umum' },
                    { id: 'islam', label: 'Islam' },
                    { id: 'kristen', label: 'Kristen' },
                    { id: 'hindu', label: 'Hindu' },
                    { id: 'buddha', label: 'Buddha' },
                    { id: 'casual', label: 'Santai' },
                    { id: 'english', label: 'English' }
                  ] as const).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className="text-[9px] font-bold px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-md cursor-pointer transition-all capitalize"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {useTemplateMessage ? (
              <>
                <textarea
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  rows={4}
                  className="w-full text-[11px] rounded-xl p-3 outline-none font-sans text-slate-200 leading-relaxed resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <p className="text-[9px] text-slate-500 leading-relaxed flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span>Gunakan <code className="bg-white/5 px-1 rounded font-mono">{'{nama_tamu}'}</code> dan <code className="bg-white/5 px-1 rounded font-mono">{'{tautan_undangan}'}</code> sebagai variabel dinamis.</span>
                </p>
              </>
            ) : (
              <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Template dinonaktifkan. Pesan yang dikirim via WhatsApp hanya berupa <span className="text-white/60 font-mono">tautan undangan</span> saja.
                </p>
              </div>
            )}
          </div>

          {/* Live Preview (Only shown for Single Share or as template preview) */}
          {activeTab === 'single' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pratinjau Pesan
              </span>
              <div className="rounded-2xl p-4 max-h-28 overflow-y-auto" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-[10px] leading-relaxed text-emerald-400 whitespace-pre-wrap font-medium">{singleFinalMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 flex items-center justify-between gap-3 bg-white/1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Tutup
          </button>
          
          {activeTab === 'single' && (
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 text-white font-bold text-xs tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Kirim via WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
