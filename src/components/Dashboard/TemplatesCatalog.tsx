import React from 'react';
import { ArrowLeft, Sparkles, Heart, CheckCircle2, ChevronRight, Smartphone, LogIn } from 'lucide-react';

interface TemplatesCatalogProps {
  onBack: () => void;
  onSelectTemplate: (key: string) => void;
  customTemplates?: any[];
  isGuestLanding?: boolean;
}

export default function TemplatesCatalog({ onBack, onSelectTemplate, customTemplates = [], isGuestLanding = false }: TemplatesCatalogProps) {
  const handlePreviewDemo = (tplSlug: string) => {
    if (tplSlug) {
      window.open(`/v/${tplSlug}`, '_blank');
    }
  };
  // Dynamic templates matching database custom templates
  const dynamicTemplates = customTemplates.map((t: any) => ({
    key: t.id,
    name: t.title,
    slug: t.slug,
    desc: `Desain kustom eksklusif buatan admin. Kustomisasi tata letak, teks, musik, dan ornamen secara penuh.`,
    price: 'Free',
    theme: 'custom',
    badge: 'KUSTOM',
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    thumbnail: t.thumbnail,
    isDynamic: true
  }));

  const templates = dynamicTemplates;

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
                // Trigger login by navigating to canvas which shows the guest auth modal
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
          {templates.map((tpl) => (
            <div 
              key={tpl.key}
              className="group bg-slate-950/50 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Cover Mockup Image */}
              <div className="relative aspect-[4/3] w-full bg-slate-900 flex items-center justify-center border-b border-slate-900 overflow-hidden">
                {(tpl as any).thumbnail ? (
                  <img 
                    src={(tpl as any).thumbnail} 
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <>
                    {/* Decorative gradients */}
                    <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-slate-950 via-slate-900 to-[#1e1b4b]" />
                    
                    {/* Simulated Mock phone inside card */}
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
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors font-cinzel">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{tpl.desc}</p>
                </div>

                {/* CTA Action */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handlePreviewDemo(tpl.slug)}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Smartphone className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Lihat Demo</span>
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
