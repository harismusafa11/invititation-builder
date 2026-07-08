import React, { useState } from 'react';
import { 
  Heart, 
  Clock, 
  MapPin, 
  BookOpen, 
  Wand2, 
  Award, 
  Mail, 
  Gift, 
  CalendarDays, 
  ChevronDown,
  MousePointerClick,
  Image,
  Play
} from 'lucide-react';

interface ComponentsPanelProps {
  onAddComponent: (type: any, presetStyle?: 'classic' | 'rustic' | 'emerald' | 'royal') => void;
}

export default function ComponentsPanel({ onAddComponent }: ComponentsPanelProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const categories = [
    {
      title: 'Intro & Profiles',
      items: [
        {
          key: 'hero' as const,
          name: 'Hero Cover Section',
          desc: 'Tampilan pembuka halaman undangan lengkap dengan inisial nama.',
          icon: Wand2,
          color: 'text-amber-500 bg-amber-50',
        },
        {
          key: 'brideGroom' as const,
          name: 'Bride & Groom Profile',
          desc: 'Profil lengkap dan foto kedua calon mempelai pengantin.',
          icon: Heart,
          color: 'text-rose-500 bg-rose-50',
        },
        {
          key: 'story' as const,
          name: 'Our Love Story',
          desc: 'Timeline kisah perjalanan cinta romantis kedua mempelai.',
          icon: BookOpen,
          color: 'text-indigo-500 bg-indigo-50',
        },
      ],
    },
    {
      title: 'Event Information',
      items: [
        {
          key: 'countdown' as const,
          name: 'Love Countdown',
          desc: 'Penghitung mundur aktif (Hari, Jam, Menit, Detik) menuju acara.',
          icon: Clock,
          color: 'text-blue-500 bg-blue-50',
        },
        {
          key: 'event' as const,
          name: 'Event Details Card',
          desc: 'Kartu informasi tanggal, waktu, akad nikah, dan resepsi.',
          icon: CalendarDays,
          color: 'text-emerald-500 bg-emerald-50',
        },
        {
          key: 'location' as const,
          name: 'Google Maps Location',
          desc: 'Tombol rute peta Google Maps & penunjuk jalan langsung.',
          icon: MapPin,
          color: 'text-violet-500 bg-violet-50',
        },
      ],
    },
    {
      title: 'Media & Galeri',
      items: [
        {
          key: 'gallery' as const,
          name: 'Galeri Foto Slide',
          desc: 'Galeri foto geser/slide interaktif dan estetik dengan efek transisi premium.',
          icon: Image,
          color: 'text-purple-500 bg-purple-50',
        },
        {
          key: 'video' as const,
          name: 'Video Youtube Embed',
          desc: 'Penyematan video streaming Youtube menggunakan tautan video.',
          icon: Play,
          color: 'text-red-500 bg-red-50',
        },
      ],
    },
    {
      title: 'Interactive & Gift',
      items: [
        {
          key: 'button' as const,
          name: 'Tombol Kustom (Buka / Link)',
          desc: 'Tombol navigasi kustom untuk membuka peta, link zoom, atau PDF.',
          icon: MousePointerClick,
          color: 'text-sky-500 bg-sky-50',
        },
        {
          key: 'rsvp' as const,
          name: 'Interactive RSVP Form',
          desc: 'Formulir konfirmasi kehadiran tamu & buku ucapan doa.',
          icon: Mail,
          color: 'text-teal-500 bg-teal-50',
        },
        {
          key: 'gift' as const,
          name: 'Digital Gift Box (Angpao)',
          desc: 'Nomor rekening bank & hadiah digital (Angpao Cashless).',
          icon: Gift,
          color: 'text-orange-500 bg-orange-50',
        },
        {
          key: 'footer' as const,
          name: 'Closing Footer',
          desc: 'Kalimat penutup manis dan ucapan terima kasih keluarga.',
          icon: Award,
          color: 'text-slate-500 bg-slate-50',
        },
      ],
    },
  ];

  const presets = [
    { 
      key: 'classic' as const, 
      label: '👑 Classic Gold Theme', 
      desc: 'Desain elegan mewah bertabur ornamen emas halus.',
      // Inline visual SVG thumbnail representation
      svg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#FDFBF7] border border-amber-350 rounded-xl flex-shrink-0 shadow-xs">
          <rect x="4" y="4" width="92" height="52" fill="none" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="7" y="7" width="86" height="46" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1.5 1.5"/>
          <line x1="25" y1="20" x2="75" y2="20" stroke="#8C7A5B" strokeWidth="1.5"/>
          <line x1="35" y1="30" x2="65" y2="30" stroke="#D4AF37" strokeWidth="2.5"/>
          <circle cx="50" cy="42" r="2.5" fill="#8C7A5B"/>
        </svg>
      )
    },
    { 
      key: 'rustic' as const, 
      label: '🌸 Indonesian Rustic', 
      desc: 'Eksotik alami dengan sentuhan ornamen kayu dan bunga melati.',
      svg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#FCF8EE] border border-amber-100 rounded-xl flex-shrink-0 shadow-xs">
          {/* Floral leaf borders */}
          <path d="M5,5 C12,3 18,10 22,5" fill="none" stroke="#8C7A5B" strokeWidth="1.2"/>
          <path d="M78,55 C82,50 88,57 95,55" fill="none" stroke="#8C7A5B" strokeWidth="1.2"/>
          <rect x="12" y="12" width="76" height="36" rx="4" fill="#FAF0D7" stroke="#E6D2B1" strokeWidth="0.8"/>
          <line x1="30" y1="22" x2="70" y2="22" stroke="#2C1D11" strokeWidth="2"/>
          <line x1="40" y1="32" x2="60" y2="32" stroke="#8C7A5B" strokeWidth="1.2"/>
        </svg>
      )
    },
    { 
      key: 'emerald' as const, 
      label: '🌿 Modern Emerald', 
      desc: 'Segar kekinian berlatar hijau botol dengan daun botani.',
      svg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#0A251C] border border-emerald-900 rounded-xl flex-shrink-0 shadow-xs">
          <rect x="5" y="5" width="90" height="50" rx="6" fill="none" stroke="#2E7D32" strokeWidth="1.5"/>
          {/* Leaves outline */}
          <circle cx="50" cy="18" r="4.5" fill="#E8F5E9"/>
          <line x1="20" y1="32" x2="80" y2="32" stroke="#E8F5E9" strokeWidth="2.5"/>
          <line x1="35" y1="42" x2="65" y2="42" stroke="#81C784" strokeWidth="1.2"/>
        </svg>
      )
    },
    { 
      key: 'royal' as const, 
      label: '👑 Royal Blue & Gold', 
      desc: 'Mewah nan anggun berlatar biru safir dengan mandala emas berkilau.',
      svg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#0B132B] border border-amber-500 rounded-xl flex-shrink-0 shadow-xs">
          <rect x="4" y="4" width="92" height="52" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
          {/* Ornate Mandala Symbol */}
          <circle cx="50" cy="30" r="10" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
          <circle cx="50" cy="30" r="6" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1 1"/>
          <line x1="50" y1="15" x2="50" y2="45" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="35" y1="30" x2="65" y2="30" stroke="#D4AF37" strokeWidth="0.5"/>
          <circle cx="50" cy="30" r="2" fill="#D4AF37"/>
        </svg>
      )
    }
  ];

  const handleToggleExpand = (itemKey: string) => {
    setExpandedItem(expandedItem === itemKey ? null : itemKey);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Wedding Components</h3>
        <p className="text-xs text-slate-400 mt-1">
          Pilih jenis komponen pernikahan dan desain template visual yang ingin dipasang ke dalam editor kanvas.
        </p>
      </div>

      {/* Categories Accordion */}
      <div className="space-y-6 max-h-[580px] overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat.title} className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{cat.title}</h4>
            <div className="space-y-2.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedItem === item.key;
                return (
                  <div key={item.key} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(item.key)}
                      className={`w-full text-left p-3 flex items-start justify-between group transition-all cursor-pointer ${
                        isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex space-x-3">
                        <div className={`p-2 rounded-xl ${item.color} transition-all group-hover:scale-105`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">{item.name}</span>
                          <span className="text-[10px] text-slate-450 leading-tight block">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 mt-1 transition-transform duration-205 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>

                    {/* Presets List with Visual Mockups inside Drawer */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-50/30 border-t border-slate-100 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                        {(item.key === 'rsvp' 
                          ? [
                              { 
                                key: 'classic' as const, 
                                label: '👑 Classic Gold RSVP & Wishes', 
                                desc: 'Formulir RSVP & Buku Tamu berlatar terang dengan aksen garis emas klasik.',
                                svg: (
                                  <svg viewBox="0 0 100 60" className="w-24 h-14 bg-white border border-amber-300 rounded-xl flex-shrink-0 shadow-xs">
                                    <rect x="4" y="4" width="92" height="52" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
                                    <line x1="20" y1="15" x2="80" y2="15" stroke="#D4AF37" strokeWidth="1"/>
                                    <rect x="15" y="24" width="70" height="6" rx="1.5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
                                    <rect x="15" y="34" width="70" height="6" rx="1.5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
                                    <rect x="15" y="44" width="70" height="8" rx="1.5" fill="#1E293B"/>
                                  </svg>
                                )
                              },
                              { 
                                key: 'emerald' as const, 
                                label: '🌿 Modern Emerald RSVP & Wishes', 
                                desc: 'Formulir RSVP & Buku Tamu bertema botani modern dengan warna hijau daun.',
                                svg: (
                                  <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#E8F5E9] border border-emerald-800 rounded-xl flex-shrink-0 shadow-xs">
                                    <rect x="4" y="4" width="92" height="52" fill="none" stroke="#2E7D32" strokeWidth="0.8"/>
                                    <line x1="20" y1="15" x2="80" y2="15" stroke="#2E7D32" strokeWidth="1"/>
                                    <rect x="15" y="24" width="70" height="6" rx="1.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5"/>
                                    <rect x="15" y="34" width="70" height="6" rx="1.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5"/>
                                    <rect x="15" y="44" width="70" height="8" rx="1.5" fill="#2E7D32"/>
                                  </svg>
                                )
                              },
                              { 
                                key: 'royal' as const, 
                                label: '✨ Luxury Dark Gold RSVP & Wishes', 
                                desc: 'Desain RSVP & Buku Tamu gelap premium dengan aksen emas mewah sesuai gambar unggahan Anda.',
                                svg: (
                                  <svg viewBox="0 0 100 60" className="w-24 h-14 bg-[#111625] border border-amber-400 rounded-xl flex-shrink-0 shadow-xs">
                                    <rect x="4" y="4" width="92" height="52" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
                                    <line x1="20" y1="15" x2="80" y2="15" stroke="#D4AF37" strokeWidth="1"/>
                                    <rect x="15" y="24" width="70" height="6" rx="1.5" fill="#1A2035" stroke="#D4AF37" strokeWidth="0.5"/>
                                    <rect x="15" y="34" width="70" height="6" rx="1.5" fill="#1A2035" stroke="#D4AF37" strokeWidth="0.5"/>
                                    <rect x="15" y="44" width="70" height="8" rx="1.5" fill="#D4AF37"/>
                                  </svg>
                                )
                              }
                            ]
                          : presets
                        ).map((preset) => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => {
                              onAddComponent(item.key, preset.key);
                              // Close automatically for clean user flow
                              setExpandedItem(null);
                            }}
                            className="w-full flex items-center space-x-3 p-2 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-left group"
                          >
                            {/* Visual Thumbnail */}
                            {preset.svg}
                            
                            <div className="space-y-0.5 flex-1 pr-1">
                              <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">{preset.label}</span>
                              <span className="text-[9px] text-slate-400 leading-snug block">{preset.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
