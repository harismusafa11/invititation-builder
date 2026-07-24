import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, Clock, User, Heart, Compass, Sparkles, ChevronRight, Filter, ShieldCheck, DollarSign, Users, Palette, Search, ExternalLink, Gift, Tag, Download, Flame, Award } from 'lucide-react';

interface BlogPortalProps {
  onBack: () => void;
  onSelectTemplate: (key: string) => void;
}

interface Article {
  slug: string;
  title: string;
  desc: string;
  category: string;
  readTime: string;
  date: string;
  content: string[];
  faqs: { q: string; a: string }[];
  youtubeId?: string;
}

const SMART_LINK_URL = "https://tuxedoarbourannouncement.com/dbnxdg1a?key=54a57f33758303e3bee47709308aa78d";

// 1. Leaderboard Banner Ad (728x90)
const AdLeaderboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const scriptConf = document.createElement('script');
    scriptConf.type = 'text/javascript';
    scriptConf.text = `
      atOptions = {
        'key' : '3084b8268a0866498649fa084c81b6f6',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    container.appendChild(scriptConf);

    const scriptInvoke = document.createElement('script');
    scriptInvoke.type = 'text/javascript';
    scriptInvoke.src = 'https://tuxedoarbourannouncement.com/3084b8268a0866498649fa084c81b6f6/invoke.js';
    container.appendChild(scriptInvoke);
  }, []);

  return (
    <div className="w-full flex justify-center items-center my-3 overflow-hidden min-h-[90px] bg-slate-950/30 border border-slate-900/60 rounded-2xl p-2 shadow-inner">
      <div ref={containerRef} className="max-w-full overflow-hidden flex justify-center" />
    </div>
  );
};

// 2. Sidebar Skyscraper Banner Ad (160x600)
const AdSidebar: React.FC<{ id?: string }> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const scriptConf = document.createElement('script');
    scriptConf.type = 'text/javascript';
    scriptConf.text = `
      atOptions = {
        'key' : 'e48b109ce2ec69cc4afcd1d987ac2cf0',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    container.appendChild(scriptConf);

    const scriptInvoke = document.createElement('script');
    scriptInvoke.type = 'text/javascript';
    scriptInvoke.src = 'https://tuxedoarbourannouncement.com/e48b109ce2ec69cc4afcd1d987ac2cf0/invoke.js';
    container.appendChild(scriptInvoke);
  }, [id]);

  return (
    <div className="w-[160px] h-[600px] flex justify-center items-center overflow-hidden bg-slate-950/50 border border-slate-900 rounded-2xl p-1 shadow-2xl shrink-0">
      <div ref={containerRef} className="w-[160px] h-[600px] overflow-hidden" />
    </div>
  );
};

// 3. Native Bar Banner Ad Component
const AdNativeBar: React.FC<{ instanceId?: string }> = ({ instanceId = '1' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const nativeDiv = document.createElement('div');
    nativeDiv.id = `container-54baef0023e23b5b4f80050ef3887bf1`;
    container.appendChild(nativeDiv);

    const scriptInvoke = document.createElement('script');
    scriptInvoke.async = true;
    scriptInvoke.setAttribute('data-cfasync', 'false');
    scriptInvoke.src = 'https://tuxedoarbourannouncement.com/54baef0023e23b5b4f80050ef3887bf1/invoke.js';
    container.appendChild(scriptInvoke);
  }, [instanceId]);

  return (
    <div className="w-full flex justify-center items-center my-5 overflow-hidden min-h-[100px] bg-slate-950/60 border border-slate-900 rounded-2xl p-3 shadow-md">
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

// 4. Smart Link Enticing Callout Cards (Multiple Hooks)
interface SmartLinkCalloutProps {
  variant?: 'featured' | 'in-article' | 'compact' | 'download';
}

const SmartLinkCallout: React.FC<SmartLinkCalloutProps> = ({ variant = 'featured' }) => {
  const handleClick = () => {
    window.open(SMART_LINK_URL, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'in-article') {
    return (
      <div 
        onClick={handleClick}
        className="my-6 bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-purple-600/20 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] shadow-2xl group relative overflow-hidden text-left"
      >
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-amber-500/25 text-amber-300 rounded-xl shrink-0 group-hover:rotate-12 transition-transform shadow-md">
            <Gift className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="inline-flex items-center space-x-1.5 text-[9px] font-extrabold tracking-widest text-amber-300 uppercase bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>REKOMENDASI SPESIAL CALON PENGANTIN</span>
            </div>
            <h4 className="text-sm md:text-base font-bold text-white font-cinzel leading-snug group-hover:text-amber-300 transition-colors">
              💎 Klaim Voucher Diskon Vendor Pernikahan &amp; Bonus VIP 2026 Gratis!
            </h4>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Dapatkan akses langsung ke promo potongan harga gedung resepsi, paket photobooth, serta e-book checklist persiapan nikah terlengkap bulan ini.
            </p>
            <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Ambil Diskon Spesial Pengantin Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="my-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-950 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">🎉 VOUCHER MUSISI &amp; PHOTOBOOTH 50% OFF</div>
            <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Klaim Promo Paket Vendor Impian Anda Sebelum Kuota Habis!</div>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shrink-0 flex items-center space-x-1 border-0 shadow-md">
          <span>Klaim</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (variant === 'download') {
    return (
      <div 
        onClick={handleClick}
        className="my-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-950 border border-purple-500/40 hover:border-purple-300 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-xl group text-left relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl shrink-0 group-hover:bounce">
              <Download className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-purple-300 tracking-widest uppercase">✨ FREE DOWNLOAD BUNDLE PENGANTIN</div>
              <h4 className="text-sm font-extrabold text-white font-cinzel group-hover:text-purple-300 transition-colors">
                Download 50+ Preset Sound Backsound &amp; Font Calligraphy Undangan
              </h4>
              <p className="text-xs text-slate-300 font-light">Kumpulan musik instrumen romantis dan font estetik siap pakai tanpa biaya.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shrink-0 flex items-center space-x-1.5 border-0 shadow-lg">
            <span>Download Gratis</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="my-6 bg-gradient-to-br from-[#12172a] via-[#101428] to-[#1c162e] border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 md:p-8 cursor-pointer transition-all hover:-translate-y-1 shadow-2xl relative overflow-hidden group text-left"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-colors" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROMO VENDOR &amp; BONUS EXCLUSIVE 2026</span>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-white font-cinzel leading-snug group-hover:text-amber-300 transition-colors">
            🎁 Dapatkan Voucher Diskon Gedung &amp; Bundle Preset Musik Undangan VIP
          </h3>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            Khusus calon pengantin! Ambil promo potongan harga khusus vendor foto/video, souvenir, dan template rundown digital eksklusif hanya untuk minggu ini.
          </p>
        </div>
        <button 
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0 group-hover:scale-105 border-0 cursor-pointer"
        >
          <span>Klaim Bonus VIP Sekarang</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function BlogPortal({ onBack, onSelectTemplate }: BlogPortalProps) {
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const slug = path.substring(6);
      if (slug) setSelectedArticleSlug(slug);
    }
  }, []);

  const articles: Article[] = [
    {
      slug: 'tips-membuat-undangan-digital-elegan',
      title: '7 Tips Membuat Undangan Digital Pernikahan yang Elegan & Menarik',
      desc: 'Panduan praktis memilih warna tema, ornamen pendukung, font tipografi, dan durasi musik latar agar undangan digital Anda terlihat sangat premium.',
      category: 'Tips & Panduan',
      readTime: '5 Menit',
      date: '03 Juli 2026',
      content: [
        'Undangan pernikahan digital kini telah menjadi pilihan utama bagi pasangan modern.',
        'Namun, membuat undangan digital yang berkelas memerlukan perhatian khusus.',
        '## 1. Pilih Warna Harmonis & Elegan',
        'Gunakan palet pastel lembut atau perpaduan kontras tinggi.',
        '## 2. Jaga Struktur Font Tipografi',
        'Font sans-serif bersih cocok untuk teks konten.',
        '## 3. Batasi Jumlah Ornamen & Dekorasi',
        'Biarkan ada ruang bernapas agar pembaca fokus pada esensi.'
      ],
      faqs: [{ q: 'Apakah undangan digital bisa dibagikan lewat WhatsApp?', a: 'Ya, undangan digital InviteStudio dikirimkan berupa link web unik.' }]
    },
    {
      slug: 'rundown-acara-pernikahan-modern',
      title: 'Contoh Susunan Acara Pernikahan (Rundown) Modern',
      desc: 'Temukan struktur rundown pernikahan nasional yang teratur.',
      category: 'Perencanaan',
      readTime: '7 Menit',
      date: '28 Juni 2026',
      content: ['Merencanakan rundown pernikahan sangat krusial.', '## Sesi 1: Persiapan & Akad Nikah', 'Fase meliputi rias dan ijab kabul.', '## Sesi 2: Jeda Istirahat', 'Penting untuk alokasi waktu istirahat.', '## Sesi 3: Resepsi & Ramah Tamah', 'Dimulai dengan grand entrance.'],
      faqs: [{ q: 'Berapa lama durasi ideal resepsi?', a: 'Rata-rata 2 hingga 3 jam.' }]
    },
    {
      slug: 'panduan-hemat-biaya-pernikahan-undangan-digital',
      title: 'Panduan Hemat Biaya Pernikahan 2026',
      desc: 'Analisis perbandingan biaya undangan fisik vs digital.',
      category: 'Anggaran & Logistik',
      readTime: '8 Menit',
      date: '20 Juli 2026',
      content: ['Merencanakan pernikahan membutuhkan pengelolaan anggaran cermat.', '## Perbandingan Biaya', 'Undangan cetak hardcover berkisar Rp 15.000 - Rp 35.000.', '## Keuntungan Finansial', 'Bebas biaya cetak ulang dan akurasi porsi catering.'],
      faqs: [{ q: 'Apakah aman mengalihkan ke digital?', a: 'Sangat aman dan modern.' }]
    },
    {
      slug: 'cara-mengelola-rsvp-buku-tamu-digital',
      title: 'Cara Mengelola RSVP & Buku Tamu Digital',
      desc: 'Panduan manajerial daftar tamu dan QR Code check-in.',
      category: 'Anggaran & Logistik',
      readTime: '6 Menit',
      date: '18 Juli 2026',
      content: ['Mengelola daftar tamu sering menjadi tantangan.', '## 1. Integrasi Formulir RSVP', 'Tamu dapat memilih status kehadiran.', '## 2. Check-In dengan QR Code', 'Sistem scan otomatis untuk tamu.'],
      faqs: [{ q: 'Bagaimana cara memantau data?', a: 'Melalui Dashboard Admin yang real-time.' }]
    },
    {
      slug: 'panduan-tema-dan-dress-code-pernikahan-digital',
      title: 'Panduan Menentukan Tema & Dress Code Pernikahan',
      desc: 'Inspirasi memilih palet warna dan dress code tamu.',
      category: 'Tren & Etnik',
      readTime: '6 Menit',
      date: '15 Juli 2026',
      content: ['Menentukan dress code menjadi tren populer.', '## 1. Cantumkan Visual Palet Warna', 'Sertakan lingkaran sampel warna.', '## 3. Sesuaikan dengan Lokasi', 'Untuk resepsi outdoor, gunakan pakaian breathable.', '## 4. Harmonisasi dengan Tema Undangan Digital', 'Pilihlah template yang warnanya seirama.'],
      faqs: [{ q: 'Apakah wajar jika mewajibkan dress code?', a: 'Sangat wajar! Sebaiknya sampaikan dalam bentuk rekomendasi agar suasana pesta pernikahan semakin semarak.' }]
    },
    {
      slug: 'tips-keamanan-dan-privasi-undangan-digital',
      title: 'Tips Menjaga Keamanan & Privasi Undangan Digital',
      desc: 'Cara melindungi data lokasi dan galeri pribadi.',
      category: 'Tips & Panduan',
      readTime: '5 Menit',
      date: '12 Juli 2026',
      content: ['Aspek privasi menjadi faktor penting.', '## 1. Gunakan Proteksi Kata Sandi', 'Halaman hanya bisa dibuka dengan PIN.', '## 4. Verifikasi Nomor Rekening', 'Pastikan nomor rekening sudah diverifikasi.'],
      faqs: [{ q: 'Apakah orang lain bisa melihat foto galeri?', a: 'Jika aktifkan password protection, tidak bisa.' }]
    },
    {
      slug: 'contoh-kata-kata-undangan-pernikahan-digital',
      title: '25 Contoh Kata-Kata Undangan Pernikahan',
      desc: 'Kumpulan inspirasi wording undangan online.',
      category: 'Inspirasi',
      readTime: '6 Menit',
      date: '08 Juli 2026',
      content: ['Memilih kata-kata adalah langkah penting.', '## Contoh Teks Islami', 'Maha suci Allah SWT.', '## Contoh Teks Kristen', 'Dalam kasih Tuhan Yesus Kristus.'],
      faqs: [{ q: 'Bagaimana cara mempersonalisasi nama tamu?', a: 'Tambahkan parameter ?to=Nama+Tamu.' }]
    },
    {
      slug: 'panduan-memilih-lagu-pernikahan-romantis',
      title: '15 Rekomendasi Lagu Pernikahan Romantis',
      desc: 'Daftar lagu pilihan untuk backsound undangan.',
      category: 'Inspirasi',
      readTime: '5 Menit',
      date: '06 Juli 2026',
      content: ['Musik latar membangun suasana romantis.', '## 1. Musik Instrumental', 'Canon in D, River Flows in You.', '## 2. Lagu Pop Indonesia', 'Kisah Sempurna, Teman Hidup.'],
      faqs: [{ q: 'Apakah musik bisa mati sendiri?', a: 'Tamu bisa mematikan melalui ikon speaker.' }]
    }
  ];

  const activeArticle = articles.find(a => a.slug === selectedArticleSlug);

  useEffect(() => {
    document.title = activeArticle ? `${activeArticle.title} - Blog` : 'Blog Pernikahan';
  }, [activeArticle]);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    setSelectedArticleSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['Semua', 'Tips & Panduan', 'Perencanaan', 'Anggaran & Logistik', 'Tren & Etnik', 'Inspirasi'];
  const filteredArticles = articles.filter(art => (selectedCategory === 'Semua' || art.category === selectedCategory) && (searchQuery === '' || art.title.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="min-h-screen bg-[#090c15] text-white font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 bg-[#090c15]/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <button onClick={activeArticle ? handleBackToBlog : onBack} className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0">
          <ArrowLeft className="w-4 h-4" />
          <span>{activeArticle ? 'Kembali ke Katalog' : 'Kembali'}</span>
        </button>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-black tracking-widest text-slate-400">InviteStudio</span>
          <span className="text-xs font-bold text-amber-500 font-serif">Blog</span>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] gap-6 items-start">
          
          <aside className="hidden xl:flex flex-col gap-6 shrink-0 sticky top-20">
            <AdSidebar id="left-banner-1" />
            <AdSidebar id="left-banner-2" />
          </aside>

          <div className="min-w-0">
            {activeArticle ? (
              <article className="space-y-8 animate-in fade-in duration-200">
                <AdLeaderboard />
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-[10px] font-extrabold uppercase text-blue-400 rounded-lg">{activeArticle.category}</span>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white font-cinzel">{activeArticle.title}</h1>
                  <div className="flex items-center space-x-4 text-slate-500 text-[10px] font-bold">
                    <span className="flex items-center space-x-1"><User className="w-3.5 h-3.5" /> <span>Tim Spesialis</span></span>
                    <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /> <span>{activeArticle.readTime}</span></span>
                    <span>•</span>
                    <span>{activeArticle.date}</span>
                  </div>
                </div>

                <AdNativeBar instanceId="article-top" />

                <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

                <div className="bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-2xl text-xs text-slate-300 italic">"{activeArticle.desc}"</div>

                <SmartLinkCallout variant="in-article" />

                <div className="space-y-5 text-sm text-slate-300 leading-relaxed font-light">
                  {activeArticle.content.map((p, idx) => {
                    const isHeading = p.startsWith('## ');
                    return (
                      <React.Fragment key={idx}>
                        {isHeading ? (
                          <h2 className="text-base md:text-lg font-bold text-amber-400 font-cinzel pt-4 pb-1 border-b border-slate-900/60">{p.replace('## ', '')}</h2>
                        ) : (
                          <p>{p}</p>
                        )}
                        {idx === 2 && <AdNativeBar instanceId="article-mid-1" />}
                        {idx === 4 && <SmartLinkCallout variant="download" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                <AdNativeBar instanceId="article-mid-2" />

                <SmartLinkCallout variant="compact" />

                {activeArticle.youtubeId && (
                  <div className="my-6 aspect-video w-full rounded-2xl overflow-hidden border border-slate-900 shadow-2xl relative bg-slate-950">
                    <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${activeArticle.youtubeId}`} allowFullScreen title={activeArticle.title}></iframe>
                  </div>
                )}

                <AdNativeBar instanceId="article-before-faq" />

                {activeArticle.faqs && activeArticle.faqs.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-4">
                    <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#D4AF37] flex items-center space-x-2 font-cinzel">
                      <Sparkles className="w-4 h-4" /> <span>Pertanyaan Umum</span>
                    </h3>
                    {activeArticle.faqs.map((faq, i) => (
                      <div key={i} className="space-y-1.5 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-900">
                        <h4 className="font-extrabold text-white">Q: {faq.q}</h4>
                        <p className="text-slate-400 font-light pl-5"><strong className="text-amber-500 font-normal">A:</strong> {faq.a}</p>
                      </div>
                    ))}
                  </div>
                )}

                <AdNativeBar instanceId="article-after-faq" />
                <SmartLinkCallout variant="featured" />
                <AdLeaderboard />
              </article>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-200">
                <AdLeaderboard />
                <AdNativeBar instanceId="catalog-top" />
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    <BookOpen className="w-3.5 h-3.5" /> <span>Pusat Edukasi</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white font-cinzel">Artikel & Panduan Pernikahan Digital</h1>
                </div>
                <SmartLinkCallout variant="featured" />
                <div className="space-y-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Cari topik artikel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white" />
                  </div>
                </div>
                <AdNativeBar instanceId="catalog-before-grid" />
                <div className="space-y-5">
                  {filteredArticles.map((art, i) => (
                    <React.Fragment key={art.slug}>
                      <div onClick={() => handleArticleClick(art.slug)} className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 md:p-8 flex justify-between items-start gap-5 hover:border-slate-800 transition-all cursor-pointer text-left group">
                        <div className="space-y-3.5 flex-1">
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px]">{art.category}</span>
                          <h2 className="text-base md:text-lg font-black text-white group-hover:text-blue-400 transition-colors font-cinzel">{art.title}</h2>
                          <p className="text-xs text-slate-400 leading-relaxed font-light">{art.desc}</p>
                        </div>
                      </div>
                      {i === 1 && <SmartLinkCallout variant="in-article" />}
                      {i === 2 && <AdNativeBar instanceId={`catalog-grid-${i}`} />}
                      {i === 4 && <SmartLinkCallout variant="download" />}
                      {i === 5 && <AdNativeBar instanceId={`catalog-grid-${i}`} />}
                      {i === 7 && <SmartLinkCallout variant="compact" />}
                    </React.Fragment>
                  ))}
                </div>
                <AdNativeBar instanceId="catalog-bottom-native" />
                <SmartLinkCallout variant="featured" />
                <AdLeaderboard />
              </div>
            )}
          </div>

          <aside className="hidden xl:flex flex-col gap-6 shrink-0 sticky top-20">
            <AdSidebar id="right-banner-1" />
            <AdSidebar id="right-banner-2" />
          </aside>
        </div>
      </main>
    </div>
  );
}
