import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Heart, CheckCircle2, Smartphone, LogIn, Calendar, Music, MapPin, ShieldCheck, Eye, Loader2 } from 'lucide-react';

interface TemplatesCatalogProps {
  onBack: () => void;
  onSelectTemplate: (key: string) => void;
  customTemplates?: any[];
  isGuestLanding?: boolean;
}

function generateTemplateSlug(title: string): string {
  if (!title) return '';
  return String(title)
    .toLowerCase()
    .replace(/^template\s*/i, '')    // hapus awalan "template "
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // hapus diacritic
    .replace(/[^a-z0-9\s-]/g, '')   // hanya alfanumerik, spasi, strip
    .trim()
    .replace(/\s+/g, '-')           // spasi → strip
    .replace(/-+/g, '-')            // strip berulang → satu strip
    .replace(/^-|-$/g, '')          // hapus strip di awal/akhir
    .substring(0, 80);
}

export default function TemplatesCatalog({ onBack, onSelectTemplate, customTemplates = [], isGuestLanding = false }: TemplatesCatalogProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL path for deep linking/direct visits
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/templates/')) {
        const slug = path.substring(11);
        if (slug) {
          setSelectedSlug(slug);
          fetchTemplate(slug);
        }
      } else {
        setSelectedSlug(null);
        setTemplateData(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchTemplate = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/templates/by-slug/${encodeURIComponent(slug)}`);
      const result = await res.json();
      if (result.success && result.data) {
        setTemplateData(result.data);
      } else {
        setError(result.error || 'Template tidak ditemukan.');
      }
    } catch (err) {
      setError('Gagal memuat detail template. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (title: string) => {
    const slug = generateTemplateSlug(title);
    window.history.pushState({}, '', `/templates/${slug}`);
    setSelectedSlug(slug);
    fetchTemplate(slug);
  };

  const handleBackToCatalog = () => {
    window.history.pushState({}, '', '/templates');
    setSelectedSlug(null);
    setTemplateData(null);
  };

  // Dynamic templates matching database custom templates
  const dynamicTemplates = customTemplates.map((t: any) => ({
    key: t.id,
    name: t.title || t.name || 'Untitled Template',
    slug: t.slug || generateTemplateSlug(t.title || t.name || ''),
    desc: `Desain kustom eksklusif buatan admin. Kustomisasi tata letak, teks, musik, dan ornamen secara penuh.`,
    price: 'Free',
    theme: 'custom',
    badge: 'KUSTOM',
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    thumbnail: t.thumbnail,
    isDynamic: true
  }));

  if (selectedSlug) {
    return (
      <div className="min-h-screen bg-[#090c15] text-white font-sans selection:bg-blue-500/30 selection:text-white flex flex-col">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 bg-[#090c15]/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleBackToCatalog}
            className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </button>
          <div className="flex items-center space-x-1">
            <span className="text-xs font-black tracking-widest text-slate-400">InviteStudio</span>
            <span className="text-xs font-bold text-amber-500 font-serif">Detail Template</span>
          </div>
        </header>

        {/* Detail Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10 items-start justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 w-full space-y-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat detail template...</p>
            </div>
          ) : error || !templateData ? (
            <div className="flex flex-col items-center justify-center py-20 w-full text-center space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase">Template Tidak Ditemukan</h2>
              <p className="text-xs text-slate-400 max-w-xs">{error || 'Detail template tidak dapat dimuat.'}</p>
              <button 
                onClick={handleBackToCatalog}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                Kembali ke Katalog
              </button>
            </div>
          ) : (
            <>
              {/* Left Column: Live Iframe Mockup */}
              <div className="w-full lg:w-auto flex justify-center shrink-0">
                <div className="relative mx-auto">
                  {/* Phone Case Shell decoration */}
                  <div className="relative w-[340px] sm:w-[360px] aspect-[9/16] max-h-[640px] rounded-[40px] border-[10px] border-slate-800 bg-slate-950 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center">
                    {/* Speaker notch */}
                    <div className="absolute top-2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-slate-900 rounded-full" />
                    </div>
                    
                    {/* Simulated live preview iframe */}
                    <iframe 
                      src={`/v/${templateData.slug || `builtin-template-${templateData.id}`}`} 
                      className="w-full h-full border-0 rounded-[30px] pt-4"
                      title={templateData.title}
                    />
                  </div>
                  
                  {/* Micro Hint */}
                  <p className="text-[10px] text-center text-slate-500 font-bold tracking-wider mt-3 uppercase">
                    📱 Coba scroll di dalam HP untuk preview live
                  </p>
                </div>
              </div>

              {/* Right Column: Template Info & CTA */}
              <div className="flex-1 space-y-8 lg:pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-[9px] font-black text-blue-400 tracking-wider uppercase">
                      Premium Quality
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black text-emerald-400 tracking-wider uppercase">
                      Gratis
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel leading-tight">
                    {templateData.title}
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">
                    Kustomisasi penuh template eksklusif "{templateData.title}" untuk merancang undangan pernikahan digital idaman Anda. Sesuaikan kata-kata, tata letak foto, galeri musik, rundown acara, hingga widget peta lokasi secara mandiri.
                  </p>
                </div>

                {/* Features Highlight */}
                <div className="bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-amber-500 tracking-widest">Fitur Unggulan Template</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Calendar, text: 'Rundown & Countdown Waktu' },
                      { icon: Music, text: 'Pustaka Musik Latar Romantis' },
                      { icon: MapPin, text: 'Navigasi Peta Google Maps' },
                      { icon: ShieldCheck, text: 'RSVP Kehadiran Online Instan' }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center space-x-3 text-xs text-slate-300 font-medium">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-amber-500 shrink-0">
                          <feat.icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{feat.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-4">
                  <button
                    onClick={() => onSelectTemplate(templateData.id)}
                    className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all flex items-center justify-center space-x-2 cursor-pointer border-0 shadow-lg shadow-blue-600/20 uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Gunakan Template Ini</span>
                  </button>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                    * Klik tombol di atas untuk membuka template di panel editor Studio Kreatif kami. Anda dapat langsung mengedit dan menyimpannya.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090c15] text-white font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090c15]/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
        >
          {isGuestLanding ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Mulai dari Nol</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Studio</span>
            </>
          )}
        </button>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-black tracking-widest text-slate-400">InviteStudio</span>
            <span className="text-xs font-bold text-amber-500 font-serif">Katalog</span>
          </div>
          {isGuestLanding && (
            <a
              href="/?login=true"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/?showLogin=true';
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Banner Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Katalog Undangan Pernikahan Terbaik</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-cinzel leading-tight">
            Pilih Template Undangan Pernikahan Digital Anda
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            Platform pembuat undangan pernikahan online terbaik di Indonesia. Pilih salah satu template eksklusif di bawah ini dan kustomisasi sesuai keinginan Anda dalam hitungan menit.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicTemplates.map((tpl) => (
            <div 
              key={tpl.key}
              className="group bg-slate-950/50 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Cover Mockup Image */}
              <div 
                onClick={() => handleOpenDetail(tpl.name)}
                className="relative aspect-[4/3] w-full bg-slate-900 flex items-center justify-center border-b border-slate-900 overflow-hidden cursor-pointer"
              >
                {tpl.thumbnail ? (
                  <img 
                    src={tpl.thumbnail} 
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-slate-950 via-slate-900 to-[#1e1b4b]" />
                    <div className="relative w-36 h-48 rounded-2xl border-2 border-slate-800 bg-[#0d0f1e] shadow-xl overflow-hidden flex flex-col items-center justify-center p-3 select-none scale-100 group-hover:scale-105 transition-all duration-500">
                      <div className="w-10 h-0.5 bg-slate-900 rounded-full absolute top-1" />
                      <Heart className="w-6 h-6 text-amber-500/60 animate-pulse" />
                      <span className="text-[6px] text-amber-500 tracking-[0.2em] font-cinzel font-black uppercase text-center mt-2 leading-none block">WEDDING OF</span>
                      <span className="text-[9px] text-white/90 font-cinzel font-bold text-center mt-1 truncate w-full">William &amp; Sophia</span>
                      <span className="text-[6px] text-slate-500 mt-2 block uppercase tracking-widest font-sans font-bold">Buka Undangan</span>
                    </div>
                  </>
                )}
                
                {/* Badge */}
                <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-[9px] font-black text-blue-400 tracking-wider">
                  {tpl.badge}
                </span>

                {/* Price Label */}
                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black text-emerald-400 tracking-wider">
                  {tpl.price}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5">
                    {tpl.colors.map((c) => (
                      <div key={c} className="w-3.5 h-3.5 rounded-full border border-slate-800" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <h3 
                    onClick={() => handleOpenDetail(tpl.name)}
                    className="text-lg font-black text-white group-hover:text-blue-400 transition-colors font-cinzel cursor-pointer"
                  >
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{tpl.desc}</p>
                </div>

                {/* CTA Action */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleOpenDetail(tpl.name)}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Lihat Detail</span>
                  </button>
                  <button
                    onClick={() => onSelectTemplate(tpl.key)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border-0 shadow-lg shadow-blue-600/15"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gunakan</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-950/30 border border-slate-900 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Kustomisasi Penuh', desc: 'Ubah teks, tata letak, ornamen floral, musik latar, serta warna tema secara real-time.' },
            { title: 'Formulir RSVP Otomatis', desc: 'Tamu mengisi kehadiran secara online dan data masuk ke dashboard pelacakan secara instan.' },
            { title: 'Navigasi Peta Lokasi', desc: 'Hubungkan maps digital lokasi gedung resepsi Anda langsung ke navigasi Google Maps.' }
          ].map((item, i) => (
            <div key={i} className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
