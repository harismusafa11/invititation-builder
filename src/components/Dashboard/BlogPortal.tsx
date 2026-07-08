import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, User, Heart, Compass, Sparkles, ChevronRight } from 'lucide-react';

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
}

export default function BlogPortal({ onBack, onSelectTemplate }: BlogPortalProps) {
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  // Set selected slug if URL has blog subpath (e.g. /blog/tips-undangan)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const slug = path.substring(6);
      if (slug) {
        setSelectedArticleSlug(slug);
      }
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
        'Undangan pernikahan digital kini telah menjadi pilihan utama bagi pasangan modern. Selain ramah lingkungan dan hemat biaya cetak, undangan digital juga menawarkan fleksibilitas kustomisasi yang tanpa batas.',
        'Namun, membuat undangan digital yang berkelas memerlukan perhatian khusus pada aspek estetika. Pilihan warna, font, dan musik harus menyatu untuk menciptakan kesan pertama yang mendalam bagi tamu undangan Anda.',
        '1. Pilih Warna Harmonis: Hindari menggunakan warna primer mentah. Gunakan palet pastel lembut atau perpaduan kontras tinggi seperti Navy & Gold untuk kesan premium.',
        '2. Jaga Struktur Font: Font sans-serif bersih (seperti Inter atau Roboto) sangat cocok untuk teks konten biasa, sedangkan font serif klasik (seperti Cinzel atau Playfair) lebih ideal untuk tajuk nama pengantin.',
        '3. Batasi Jumlah Ornamen: Jangan memenuhi layar dengan terlalu banyak animasi bunga atau glitter. Biarkan ada ruang bernapas agar pembaca fokus pada esensi informasi.',
        '4. Pilih Musik Latar yang Tepat: Musik instrumen piano cover atau akustik lambat sangat disarankan karena dapat membangkitkan suasana romantis tanpa mengganggu pembaca.',
        '5. Pastikan Navigasi Maps Akurat: Masukkan koordinat koordinat Google Maps yang benar agar tamu Anda tidak tersesat saat menuju gedung resepsi.'
      ],
      faqs: [
        { q: 'Apakah undangan digital bisa dibagikan lewat WhatsApp?', a: 'Ya, undangan digital InviteStudio dikirimkan berupa link web unik yang sangat mudah dibagikan melalui chat WhatsApp, Telegram, LINE, atau email.' },
        { q: 'Bagaimana cara menambahkan lagu di undangan?', a: 'Di platform kami, Anda dapat dengan mudah mengupload file lagu favorit Anda atau memilih musik romantis yang sudah kami sediakan di dalam perpustakaan musik.' }
      ]
    },
    {
      slug: 'rundown-acara-pernikahan-modern',
      title: 'Contoh Susunan Acara Pernikahan (Rundown) Modern yang Rapi & Terstruktur',
      desc: 'Temukan struktur rundown pernikahan nasional dari akad nikah/pemberkatan, sesi pemotretan, hingga resepsi makan malam yang teratur.',
      category: 'Perencanaan',
      readTime: '7 Menit',
      date: '28 Juni 2026',
      content: [
        'Merencanakan susunan acara (rundown) pernikahan sangat krusial untuk memastikan seluruh rangkaian acara berjalan tepat waktu dan khidmat tanpa kendala teknis.',
        'Rundown acara pernikahan modern biasanya terbagi menjadi tiga fase utama: persiapan & akad, resepsi formal, dan ramah tamah/hiburan santai.',
        'Penting untuk mengalokasikan waktu istirahat yang cukup bagi kedua mempelai di antara prosesi akad dan resepsi agar penampilan tetap segar.',
        'Gunakan bagan checklist digital atau sampaikan rundown Anda secara ringkas melalui widget agenda di halaman undangan digital agar keluarga dekat serta panitia dapat berkoordinasi dengan mudah.'
      ],
      faqs: [
        { q: 'Berapa lama durasi ideal resepsi pernikahan?', a: 'Rata-rata resepsi pernikahan di Indonesia berlangsung selama 2 hingga 3 jam, yang mencakup prosesi masuk, doa, bersalaman, makan malam, dan sesi foto bersama.' },
        { q: 'Apakah susunan acara perlu ditampilkan di undangan digital?', a: 'Ya, menampilkan agenda acara sangat dianjurkan agar tamu undangan tahu waktu yang tepat untuk datang, terutama jika ada pembagian sesi kedatangan.' }
      ]
    },
    {
      slug: 'contoh-kata-kata-undangan-pernikahan-digital',
      title: '25 Contoh Kata-Kata Undangan Pernikahan Digital yang Sopan & Menarik',
      desc: 'Kumpulan inspirasi kata-kata (wording) untuk undangan pernikahan online digital, mulai dari islami, kristen, kasual, hingga bahasa Inggris yang sopan.',
      category: 'Inspirasi',
      readTime: '6 Menit',
      date: '08 Juli 2026',
      content: [
        'Memilih kata-kata atau teks undangan pernikahan digital (wording) merupakan langkah penting untuk menyampaikan rasa hormat dan kegembiraan Anda kepada calon tamu secara daring.',
        'Dibandingkan dengan undangan fisik konvensional, kata-kata pada undangan digital cenderung lebih ringkas namun tetap dituntut memiliki kesan sopan santun yang tinggi (khususnya jika disebarkan melalui media sosial seperti WhatsApp).',
        'Islami: "Maha suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho-Nya, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri prosesi pernikahan kami..."',
        'Kristen/Katolik: "Dalam kasih dan anugerah Tuhan Yesus Kristus yang mempersatukan, kami mengundang kerabat sekalian untuk ikut serta menyaksikan dan mendoakan ikatan janji suci pernikahan kami..."',
        'Kasual / Modern: "Tanpa mengurangi rasa hormat, kami bermaksud mengundang teman-teman sekalian untuk datang dan merayakan kebahagiaan kami dalam acara pernikahan..."',
        'Bahasa Inggris (Formal): "Together with our families, we invite you to share in our joy as we exchange our wedding vows and begin our life journey together..."',
        'Tips Tambahan: Pastikan untuk menuliskan nama tamu dengan benar menggunakan fitur nama tamu dinamis (custom link) agar undangan terasa lebih personal dan eksklusif bagi setiap penerima.'
      ],
      faqs: [
        { q: 'Bagaimana cara mempersonalisasi nama tamu di undangan digital?', a: 'Di InviteStudio, Anda cukup menambahkan parameter nama tamu di ujung link URL undangan Anda (misalnya ?to=Nama+Tamu). Sistem akan otomatis memunculkan nama tamu tersebut secara dinamis di halaman cover.' },
        { q: 'Apakah format teks undangan digital berbeda dengan undangan cetak?', a: 'Teks undangan digital biasanya lebih fleksibel karena ditunjang fitur multimedia. Namun, susunan inti seperti nama mempelai, detail waktu, dan peta lokasi tetap harus diletakkan secara runut.' }
      ]
    },
    {
      slug: 'panduan-memilih-lagu-pernikahan-romantis',
      title: '15 Rekomendasi Lagu Pernikahan Romantis untuk Musik Latar Undangan Digital',
      desc: 'Daftar rekomendasi lagu pernikahan romantis terpopuler (instrumental, pop, klasik) sebagai musik latar (backsound) undangan pernikahan digital Anda.',
      category: 'Inspirasi',
      readTime: '5 Menit',
      date: '06 Juli 2026',
      content: [
        'Musik latar (backsound) pada undangan digital memegang peran yang sangat penting dalam membangun suasana romantis (mood) ketika tamu pertama kali membuka link undangan Anda.',
        'Pemilihan lagu yang pas dapat membuat tamu betah membaca seluruh informasi pernikahan Anda, mulai dari cerita cinta, galeri foto, hingga detail lokasi acara.',
        'Musik Instrumental (Piano/Biola): Lagu-lagu klasik instrumental seperti \'Canon in D\' (Pachelbel) atau instrumental \'A Thousand Years\' sangat cocok bagi Anda yang menginginkan nuansa syahdu, elegan, dan khidmat.',
        'Lagu Pop Romantis Indonesia: Lagu seperti \'Kisah Sempurna\' (Mahalini), \'Teman Hidup\' (Tulus), atau \'Komang\' (Raim Laode) memberikan atmosfer yang hangat, akrab, dan kekinian.',
        'Lagu Pop Romantis Barat: Pilihan populer seperti \'Perfect\' (Ed Sheeran), \'Until I Found You\' (Stephen Sanchez), atau \'Marry You\' (Bruno Mars) sangat ideal untuk suasana ceria dan modern.',
        'Tips Pengaturan: Atur agar musik berjalan otomatis (autoplay) saat tamu mengeklik tombol \'Buka Undangan\' dengan volume sedang agar tidak mengejutkan penerima pesan.'
      ],
      faqs: [
        { q: 'Apakah musik latar bisa mati sendiri?', a: 'Tamu undangan dapat mematikan atau menyalakan kembali musik latar kapan saja dengan mengeklik tombol ikon speaker floating (Volume) yang tersedia di pojok layar.' },
        { q: 'Lagu apa yang paling populer digunakan sebagai backsound undangan digital?', a: 'Lagu instrumental piano seperti \'Canon in D\' dan lagu pop akustik lambat adalah tipe lagu paling favorit karena memiliki tempo lambat yang sangat menenangkan.' }
      ]
    },
    {
      slug: 'tren-desain-undangan-digital-pernikahan-2026',
      title: 'Tren Desain Undangan Pernikahan Digital Terpopuler Tahun 2026',
      desc: 'Ulasan mendalam mengenai tren warna, ornamen batik modern, efek paralaks, dan fitur interaktif undangan online yang hits tahun ini.',
      category: 'Tren & Inspirasi',
      readTime: '6 Menit',
      date: '08 Juli 2026',
      content: [
        'Desain undangan digital terus berevolusi seiring dengan perkembangan teknologi web dan preferensi estetika pasangan muda. Memasuki tahun 2026, terjadi pergeseran tren yang signifikan dari gaya minimalis polos ke arah tampilan yang lebih interaktif, hidup, dan berkarakter.',
        'Warna Tema yang Berani & Mewah: Warna pastel monokromatik mulai digantikan oleh palet warna yang lebih tegas dan berkelas. Kombinasi Emerald Green (Hijau Botol), Terracotta hangat, serta paduan klasik Royal Navy Blue & Gold menjadi pilihan dominan.',
        'Sentuhan Etnik & Batik Heritage: Penggunaan ornamen khas nusantara seperti Gunungan Jawa, ukiran emas Bali, dan motif mega mendung atau sulur floral semakin banyak diminati. Ini memberikan kesan sakral dan melestarikan budaya namun dikemas dalam format web modern yang sangat premium.',
        'Interaktivitas Interaktif & Efek Paralaks: Penggunaan scroll-reveal animation yang mulus serta background paralaks menciptakan kedalaman visual ketika tamu berinteraksi dengan layar smartphone mereka.',
        'Fitur Premium Baru: RSVP real-time, angpao digital/dompet digital terintegrasi, hitung mundur (countdown), serta buku tamu interaktif telah menjadi standar wajib bagi undangan digital kelas atas.'
      ],
      faqs: [
        { q: 'Apa warna tema terpopuler untuk undangan digital tahun 2026?', a: 'Emerald Green, Terracotta Warm, dan Royal Navy Blue & Gold adalah palet terfavorit saat ini.' },
        { q: 'Apakah bisa menggabungkan unsur adat ke undangan modern?', a: 'Tentu saja, InviteStudio menyediakan perpaduan ornamen tradisional seperti gunungan, ukiran emas Bali, dan batik heritage yang dikemas secara modern.' }
      ]
    },
    {
      slug: 'cara-menyebarkan-link-undangan-digital-lewat-whatsapp',
      title: 'Cara Menyebarkan Link Undangan Digital via WhatsApp yang Sopan & Benar',
      desc: 'Tips dan panduan etika membagikan tautan undangan pernikahan online kepada kerabat, keluarga dekat, teman kantor, beserta template pesan sopan.',
      category: 'Tips & Panduan',
      readTime: '5 Menit',
      date: '08 Juli 2026',
      content: [
        'WhatsApp adalah media utama yang digunakan masyarakat Indonesia untuk mendistribusikan link undangan digital. Namun, karena sifatnya yang instan, sering kali pengirim melupakan aspek tata krama atau etika berkomunikasi.',
        'Agar niat baik Anda disambut hangat oleh penerima, ikutilah panduan tata krama menyebarkan undangan pernikahan digital berikut ini.',
        '1. Kirim secara Personal (Japri): Hindari membagikan tautan undangan secara massal di grup WhatsApp, terutama grup keluarga besar atau alumni sekolah, kecuali untuk kepentingan pengumuman umum. Kiriman japri terasa jauh lebih menghormati tamu.',
        '2. Personalisasi Nama Tamu: Manfaatkan fitur personalisasi nama tamu dinamis yang disediakan InviteStudio. Dengan menambahkan nama tamu di akhir link (misalnya ?to=Nama+Tamu), tamu akan merasa dihargai secara eksklusif saat membuka undangan.',
        '3. Gunakan Template Pesan yang Sopan: Mulailah pesan Anda dengan salam, permohonan maaf karena mengirimkan undangan secara digital (jika jarak menghalangi pertemuan langsung), perkenalkan diri beserta pasangan, cantumkan link undangan secara jelas, dan tutup dengan ungkapan terima kasih yang tulus.',
        '4. Perhatikan Waktu Pengiriman: Kirimkan undangan Anda antara 2 hingga 4 minggu sebelum hari H. Mengirim terlalu cepat berisiko membuat tamu lupa, sedangkan mengirim terlalu dekat hari H membuat tamu sulit menyesuaikan jadwal mereka.'
      ],
      faqs: [
        { q: 'Kapan waktu terbaik untuk mengirimkan link undangan digital?', a: 'Idealnya adalah 2 hingga 4 minggu sebelum hari H acara pernikahan diselenggarakan.' },
        { q: 'Apakah boleh menyebarkan undangan digital lewat grup WA?', a: 'Sebaiknya hindari mengirim di grup untuk kerabat dekat atau senior. Mengirim secara personal (japri) jauh lebih sopan dan dihargai.' }
      ]
    }
  ];

  const activeArticle = articles.find(a => a.slug === selectedArticleSlug);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
    window.history.pushState({}, '', `/blog/${slug}`);
  };

  const handleBackToBlog = () => {
    setSelectedArticleSlug(null);
    window.history.pushState({}, '', '/blog');
  };

  return (
    <div className="min-h-screen bg-[#090c15] text-white font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090c15]/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={activeArticle ? handleBackToBlog : onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{activeArticle ? 'Kembali ke Blog' : 'Kembali ke Studio'}</span>
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-xs font-black tracking-widest text-slate-400">InviteStudio</span>
          <span className="text-xs font-bold text-amber-500 font-serif">Blog</span>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {activeArticle ? (
          /* READ ARTICLE VIEW */
          <article className="space-y-8 animate-in fade-in duration-200">
            {/* Meta header */}
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-extrabold uppercase tracking-widest text-blue-400 rounded-lg">
                {activeArticle.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight font-cinzel">
                {activeArticle.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-slate-500 text-[10px] font-bold">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Tim Penulis InviteStudio</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeArticle.readTime} Bacaan</span>
                </span>
                <span>•</span>
                <span>{activeArticle.date}</span>
              </div>
            </div>

            {/* Featured decorative divider */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

            {/* Article Content paragraphs */}
            <div className="space-y-5 text-sm text-slate-300 leading-relaxed font-light font-sans">
              {activeArticle.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* FAQs Widget section */}
            {activeArticle.faqs && activeArticle.faqs.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#D4AF37] flex items-center space-x-1.5 font-cinzel">
                  <Sparkles className="w-4 h-4" />
                  <span>Pertanyaan Umum (FAQ)</span>
                </h3>
                <div className="space-y-4">
                  {activeArticle.faqs.map((faq, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <h4 className="font-extrabold text-white">Q: {faq.q}</h4>
                      <p className="text-slate-400 font-light leading-relaxed">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Call to Action Card */}
            <div className="bg-gradient-to-r from-[#0d0f1e] to-slate-950 border border-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2 max-w-md text-left">
                <h3 className="text-base font-extrabold text-white font-cinzel">Siap Membuat Undangan Pernikahan Anda?</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Mulai rancang undangan digital impian Anda di InviteStudio secara gratis. Dilengkapi 20+ fitur interaktif dan template adat modern terlengkap di Indonesia.
                </p>
              </div>

              <button
                onClick={() => onSelectTemplate('premiumIndonesianFloral')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer border-0 shadow-lg shadow-blue-600/20"
              >
                <Sparkles className="w-4.5 h-4.5" />
                <span>Buat Undangan Gratis</span>
              </button>
            </div>
          </article>
        ) : (
          /* ARTICLES LIST VIEW */
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* Catalog Intro Banner */}
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pusat Edukasi &amp; Tips Pernikahan</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-cinzel">
                Artikel &amp; Panduan Pernikahan Digital
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Dapatkan tips persiapan pernikahan, susunan acara resepsi, pilihan dekorasi terpopuler, hingga inspirasi kata-kata undangan pernikahan digital dari tim spesialis InviteStudio.
              </p>
            </div>

            {/* Articles List Grid */}
            <div className="space-y-6">
              {articles.map((art) => (
                <div 
                  key={art.slug}
                  onClick={() => handleArticleClick(art.slug)}
                  className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left"
                >
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px]">
                        {art.category}
                      </span>
                      <span>•</span>
                      <span>{art.date}</span>
                    </div>

                    <h2 className="text-base md:text-lg font-black text-white hover:text-blue-400 transition-colors font-cinzel leading-snug">
                      {art.title}
                    </h2>
                    
                    <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-2">
                      {art.desc}
                    </p>

                    <div className="flex items-center space-x-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.readTime} Baca</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 shrink-0 self-center hidden md:flex">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
