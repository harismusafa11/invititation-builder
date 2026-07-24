import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, User, Heart, Compass, Sparkles, ChevronRight, Filter, ShieldCheck, DollarSign, Users, Palette, Search } from 'lucide-react';

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

export default function BlogPortal({ onBack, onSelectTemplate }: BlogPortalProps) {
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        '## 1. Pilih Warna Harmonis & Elegan',
        'Hindari menggunakan warna primer mentah. Gunakan palet pastel lembut atau perpaduan kontras tinggi seperti Navy & Gold, Emerald & Bronze, atau Terracotta warm untuk kesan premium.',
        '## 2. Jaga Struktur Font Tipografi',
        'Font sans-serif bersih (seperti Inter atau Montserrat) sangat cocok untuk teks konten biasa, sedangkan font serif klasik (seperti Cinzel atau Playfair Display) lebih ideal untuk tajuk nama pengantin.',
        '## 3. Batasi Jumlah Ornamen & Dekorasi',
        'Jangan memenuhi layar dengan terlalu banyak animasi bunga atau glitter. Biarkan ada ruang bernapas (white space) agar pembaca fokus pada esensi informasi pernikahan Anda.',
        '## 4. Pilih Musik Latar yang Tepat',
        'Musik instrumen piano cover atau akustik lambat sangat disarankan karena dapat membangkitkan suasana romantis tanpa mengganggu pembaca.',
        '## 5. Pastikan Navigasi Maps Presisi',
        'Masukkan koordinat Google Maps yang benar agar tamu Anda tidak tersesat saat menuju lokasi akad maupun gedung resepsi.'
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
        'Rundown acara pernikahan modern biasanya terbagi menjadi tiga fase utama: persiapan & akad/pemberkatan, resepsi formal, dan ramah tamah/hiburan santai.',
        '## Sesi 1: Persiapan & Akad Nikah (07.00 - 10.00)',
        'Fase ini meliputi rias pengantin, penyerahan seserahan, ijab kabul atau pemberkatan nikah, hingga penandatanganan dokumen resmi dan foto keluarga inti.',
        '## Sesi 2: Jeda Istirahat & Touch Up (10.00 - 11.30)',
        'Penting untuk mengalokasikan waktu istirahat yang cukup bagi kedua mempelai di antara prosesi akad dan resepsi agar stamina dan penampilan tetap segar.',
        '## Sesi 3: Resepsi & Ramah Tamah (11.30 - 14.00)',
        'Dimulai dengan grand entrance pengantin, sambutan keluarga, doa bersama, pemotongan kue (opsional), ramah tamah makan siang, dan sesi foto bersama tamu undangan.',
        'Gunakan bagan checklist digital atau sampaikan rundown Anda secara ringkas melalui widget agenda di halaman undangan digital agar keluarga dekat serta panitia dapat berkoordinasi dengan mudah.'
      ],
      faqs: [
        { q: 'Berapa lama durasi ideal resepsi pernikahan?', a: 'Rata-rata resepsi pernikahan di Indonesia berlangsung selama 2 hingga 3 jam, yang mencakup prosesi masuk, doa, bersalaman, makan malam, dan sesi foto bersama.' },
        { q: 'Apakah susunan acara perlu ditampilkan di undangan digital?', a: 'Ya, menampilkan agenda acara sangat dianjurkan agar tamu undangan tahu waktu yang tepat untuk datang, terutama jika ada pembagian sesi kedatangan.' }
      ]
    },
    {
      slug: 'panduan-hemat-biaya-pernikahan-undangan-digital',
      title: 'Panduan Hemat Biaya Pernikahan 2026: Mengapa Undangan Digital Adalah Solusi Terbaik',
      desc: 'Analisis perbandingan biaya undangan fisik cetak vs undangan digital online. Hemat hingga jutaan Rupiah dengan fitur lengkap dan ramah lingkungan.',
      category: 'Anggaran & Logistik',
      readTime: '8 Menit',
      date: '20 Juli 2026',
      content: [
        'Merencanakan pernikahan impian membutuhkan pengelolaan anggaran (budgeting) yang cermat. Salah satu pos pengeluaran terbesar yang sering kali dapat diefisienkan secara signifikan adalah anggaran untuk percetakan undangan fisik.',
        'Di era serba digital tahun 2026, semakin banyak pasangan calon pengantin yang beralih menggunakan undangan digital berbasis web karena efisiensi biaya dan kemudahan aksesnya.',
        '## Perbandingan Biaya: Undangan Cetak vs Undangan Digital',
        'Undangan cetak hardcover berkisar antara Rp 15.000 hingga Rp 35.000 per lembar. Jika Anda mengundang 500 orang, total biaya cetak dapat mencapai Rp 7.500.000 hingga Rp 17.500.000 (belum termasuk kurir/ongkir).',
        'Sebaliknya, dengan undangan digital di InviteStudio, Anda cukup mengeluarkan biaya satu kali yang terjangkau (bahkan tersedia opsi gratis) tanpa batasan jumlah tamu yang dikirimkan. Penghematan biaya ini bisa Anda alokasikan untuk pos penting lain seperti catering, dokumentasi foto/video, atau dana tabungan rumah tangga.',
        '## 3 Keuntungan Finansial Utama Undangan Digital',
        '1. Bebas Biaya Cetak Ulang: Jika terjadi perubahan jam acara atau lokasi venue, Anda tidak perlu mencetak ulang undangan. Cukup edit data di editor studio, dan informasi otomatis terupdate secara realtime.',
        '2. Akurasi Porsi Catering lewat RSVP: Dengan fitur konfirmasi kehadiran (RSVP online), Anda tahu secara presisi jumlah pasti tamu yang hadir. Ini mencegah pemborosan pemesanan porsi makanan catering berlebih.',
        '3. Tanpa Ongkos Kirim: Distribusi undangan dilakukan secara gratis melalui link WhatsApp, email, maupun media sosial tanpa perlu memesan jasa kurir ekspedisi.'
      ],
      faqs: [
        { q: 'Apakah aman mengalihkan seluruh undangan ke format digital?', a: 'Sangat aman dan modern! Untuk kerabat sepuh/senior, Anda tetap bisa mencetak beberapa eksemplar fisik terbatas jika dibutuhkan, sementara 90% kerabat lainnya dikirimkan link digital.' },
        { q: 'Berapa persen potensi penghematan dengan undangan digital?', a: 'Pasangan pengantin rata-rata menghemat 70% hingga 90% dari total anggaran alokasi undangan tradisional.' }
      ]
    },
    {
      slug: 'cara-mengelola-rsvp-buku-tamu-digital',
      title: 'Cara Efektif Mengelola RSVP & Buku Tamu Digital untuk Resepsi Pernikahan Tanpa Ribet',
      desc: 'Panduan manajerial mengurutkan daftar tamu, konfirmasi kehadiran otomatis real-time, QR Code check-in di gedung, dan fitur amplop digital.',
      category: 'Anggaran & Logistik',
      readTime: '6 Menit',
      date: '18 Juli 2026',
      content: [
        'Mengelola daftar tamu (guest list) sering kali menjadi tantangan tersendiri bagi calon pengantin. Ketidakpastian jumlah tamu yang hadir dapat menyebabkan kekacauan pada porsi catering maupun kapasitas kursi di ruangan resepsi.',
        'Hadirnya teknologi RSVP & Buku Tamu Digital (Digital Guestbook) dari InviteStudio mempermudah manajemen logistik acara Anda dari fase persiapan hingga hari H.',
        '## 1. Integrasi Formulir RSVP Real-Time',
        'Setiap undangan digital yang dibagikan memiliki widget RSVP di mana tamu dapat memilih status kehadiran (Hadir / Tidak Hadir / Masih Ragu) serta menentukan berapa orang yang akan ikut mendampingi.',
        '## 2. Check-In Cepat dengan QR Code',
        'Hindari antrean panjang di meja penerima tamu! Sistem InviteStudio menyediakan QR Code unik untuk setiap tamu. Saat tiba di gedung, panitia cukup melakukan scan QR Code via smartphone untuk mencatat kehadiran secara otomatis.',
        '## 3. Fitur Amplop & Dompet Digital Terintegrasi',
        'Bagi tamu yang berhalangan hadir namun ingin memberikan tanda kasih atau hadiah pernikahan, undangan digital dilengkapi widget Amplop Digital (transfer bank & QRIS) serta pengiriman kado fisik langsung ke alamat rumah pengantin.',
        '## 4. Ucapan & Doa Digital (Live Wishing Wall)',
        'Tamu dapat menuliskan kata-kata mutiara, ucapan selamat, dan doa restu di dalam buku tamu digital yang tampil estetik di layar undangan.'
      ],
      faqs: [
        { q: 'Bagaimana cara memantau data RSVP yang masuk?', a: 'Anda dapat memantau seluruh data konfirmasi kehadiran tamu secara langsung melalui Dashboard Admin InviteStudio yang terupdate secara real-time.' },
        { q: 'Apakah QR Code buku tamu membutuhkan alat scan khusus?', a: 'Tidak butuh alat khusus. Kamera HP Android maupun iPhone panitia penerima tamu dapat langsung discan tanpa aplikasi tambahan.' }
      ]
    },
    {
      slug: 'panduan-tema-dan-dress-code-pernikahan-digital',
      title: 'Panduan Menentukan Tema & Dress Code Pernikahan dalam Undangan Digital',
      desc: 'Inspirasi memilih palet warna dress code (Earth tone, Pastel, Black Tie, Rustic) dan cara mengomunikasikannya secara estetik kepada tamu.',
      category: 'Tren & Etnik',
      readTime: '6 Menit',
      date: '15 Juli 2026',
      content: [
        'Menentukan tema warna dan etiket pakaian (dress code) bagi tamu undangan kini menjadi tren populer dalam pernikahan modern. Tampilan busana tamu yang selaras dan harmonis akan membuat dokumentasi foto resepsi terlihat sangat anggun dan fotogenik.',
        'Namun, bagaimana cara menyampaikan ketentuan dress code agar tamu merasa nyaman dan tidak merasa terbebani?',
        '## 1. Cantumkan Visual Palet Warna pada Undangan',
        'Jangan hanya menuliskan teks nama warna. Sertakan lingkaran bulatan sampel warna (color swatches) pada halaman undangan digital Anda, misalnya: Sage Green, Champagne Gold, Nude Sand, dan Terracotta.',
        '## 2. Berikan Tingkat Kelonggaran (Flexibility)',
        'Berikan opsi warna turunan atau alternatif agar tamu dapat mencocokkan dengan isi lemari pakaian mereka tanpa harus membeli baju baru.',
        '## 3. Sesuaikan dengan Lokasi Venue',
        'Untuk resepsi outdoor garden party, sarankan pakaian yang ringan, breathable, dan sepatu flat/wedges (menghindari stiletto tumit tinggi di atas rumput). Untuk acara indoor ballroom malam hari, konsep Black Tie atau Formal Evening Dress sangat pas.',
        '## 4. Harmonisasi dengan Tema Undangan Digital',
        'Pilihlah template undangan digital di InviteStudio yang warnanya seirama dengan tema pernikahan Anda. Misalnya, gunakan template Etnik Jawa Heritage jika pakaian yang disarankan adalah Batik Modern.'
      ],
      faqs: [
        { q: 'Apakah wajar jika mewajibkan dress code kepada tamu?', a: 'Sangat wajar! Sebaiknya sampaikan dalam bentuk rekomendasi atau panduan agar suasana pesta pernikahan semakin semarak.' },
        { q: 'Di mana posisi terbaik meletakkan info dress code pada undangan?', a: 'Letakkan di bagian bawah detail waktu & lokasi acara, atau buat section khusus ber-icon "Dress Code Guide".' }
      ]
    },
    {
      slug: 'tips-keamanan-dan-privasi-undangan-digital',
      title: 'Tips Menjaga Keamanan & Privasi Undangan Pernikahan Digital Anda',
      desc: 'Cara melindungi data lokasi, foto galeri pribadi, dan nomor rekening dari penyalahgunaan internet dengan fitur proteksi kata sandi dan link kustom.',
      category: 'Tips & Panduan',
      readTime: '5 Menit',
      date: '12 Juli 2026',
      content: [
        'Karena undangan pernikahan digital dipublikasikan di internet, aspek keamanan dan privasi informasi pribadi menjadi faktor yang sangat penting untuk diperhatikan oleh calon pengantin.',
        'Informasi sensitif seperti lokasi rumah, nomor telepon pribadi, foto galeri prewedding, hingga nomor rekening bank harus dilindungi agar tidak disalahgunakan oleh pihak yang tidak bertanggung jawab.',
        '## 1. Gunakan Fitur Proteksi Kata Sandi (Password Protection)',
        'Di InviteStudio, Anda dapat mengaktifkan fitur kata sandi. Halaman undangan hanya bisa dibuka setelah tamu memasukkan kode PIN unik yang telah Anda tentukan.',
        '## 2. Manfaatkan Parameter Nama Tamu Khusus (Private Custom Link)',
        'Dengan membagikan link khusus berbasis URL token (misalnya ?to=NamaTamu), Anda dapat membatasi akses hanya untuk penerima pesan resmi.',
        '## 3. Batasi Pencarian Mesin Crawler (No-Index Option)',
        'Jika Anda tidak ingin halaman undangan pribadi Anda masuk ke hasil pencarian publik Google, aktifkan opsi fitur privasi di menu Pengaturan Undangan.',
        '## 4. Verifikasi Nomor Rekening & QRIS Resmi',
        'Pastikan nomor rekening bank dan nama pemilik akun yang tercantum di fitur Amplop Digital sudah diverifikasi sesuai dengan nama mempelai atau keluarga inti.'
      ],
      faqs: [
        { q: 'Apakah orang lain yang tidak diundang bisa melihat foto galeri kita?', a: 'Jika Anda mengaktifkan fitur Password Protection atau Private Link, orang asing tidak akan bisa mengakses foto galeri tanpa kata sandi.' },
        { q: 'Apakah aman mencantumkan nomor rekening di undangan digital?', a: 'Sangat aman jika menggunakan platform tepercaya seperti InviteStudio yang dilengkapi enkripsi SSL dan fitur perlindungan data.' }
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
        '## Contoh Teks Undangan Islami',
        '"Maha suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho-Nya, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri prosesi pernikahan kami..."',
        '## Contoh Teks Undangan Kristen / Katolik',
        '"Dalam kasih dan anugerah Tuhan Yesus Kristus yang mempersatukan, kami mengundang kerabat sekalian untuk ikut serta menyaksikan dan mendoakan ikatan janji suci pernikahan kami..."',
        '## Contoh Teks Kasual & Modern',
        '"Tanpa mengurangi rasa hormat, kami bermaksud mengundang teman-teman sekalian untuk datang dan merayakan kebahagiaan kami dalam acara pernikahan..."',
        '## Contoh Teks Bahasa Inggris (Formal)',
        '"Together with our families, we invite you to share in our joy as we exchange our wedding vows and begin our life journey together..."',
        '## Tips Tambahan Personalisasi Teks',
        'Pastikan untuk menuliskan nama tamu dengan benar menggunakan fitur nama tamu dinamis (custom link) agar undangan terasa lebih personal dan eksklusif bagi setiap penerima.'
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
        '## 1. Musik Instrumental (Piano & Biola Klasik)',
        'Lagu-lagu klasik instrumental seperti \'Canon in D\' (Pachelbel), \'River Flows in You\' (Yiruma), atau instrumental \'A Thousand Years\' sangat cocok bagi Anda yang menginginkan nuansa syahdu, elegan, dan khidmat.',
        '## 2. Lagu Pop Romantis Indonesia',
        'Lagu seperti \'Kisah Sempurna\' (Mahalini), \'Teman Hidup\' (Tulus), \'Komang\' (Raim Laode), atau \'Menikahimu\' (Kahitna) memberikan atmosfer yang hangat, akrab, dan kekinian.',
        '## 3. Lagu Pop Romantis Barat',
        'Pilihan populer seperti \'Perfect\' (Ed Sheeran), \'Until I Found You\' (Stephen Sanchez), \'All of Me\' (John Legend), atau \'Marry You\' (Bruno Mars) sangat ideal untuk suasana ceria dan modern.',
        '## Tips Pengaturan Musik Latar',
        'Atur agar musik berjalan otomatis (autoplay) saat tamu mengeklik tombol \'Buka Undangan\' dengan volume sedang agar tidak mengejutkan penerima pesan.'
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
      category: 'Tren & Etnik',
      readTime: '6 Menit',
      date: '08 Juli 2026',
      content: [
        'Desain undangan digital terus berevolusi seiring dengan perkembangan teknologi web dan preferensi estetika pasangan muda. Memasuki tahun 2026, terjadi pergeseran tren yang signifikan dari gaya minimalis polos ke arah tampilan yang lebih interaktif, hidup, dan berkarakter.',
        '## 1. Warna Tema yang Berani & Mewah',
        'Warna pastel monokromatik mulai digantikan oleh palet warna yang lebih tegas dan berkelas. Kombinasi Emerald Green (Hijau Botol), Terracotta hangat, serta paduan klasik Royal Navy Blue & Gold menjadi pilihan dominan.',
        '## 2. Sentuhan Etnik & Batik Heritage',
        'Penggunaan ornamen khas nusantara seperti Gunungan Jawa, ukiran emas Bali, dan motif mega mendung atau sulur floral semakin banyak diminati. Ini memberikan kesan sakral dan melestarikan budaya namun dikemas dalam format web modern yang sangat premium.',
        '## 3. Interaktivitas & Efek Paralaks Dynamic',
        'Penggunaan scroll-reveal animation yang mulus serta background paralaks menciptakan kedalaman visual ketika tamu berinteraksi dengan layar smartphone mereka.',
        '## 4. Fitur Premium Standar Baru',
        'RSVP real-time, angpao digital/dompet digital terintegrasi, hitung mundur (countdown), serta buku tamu interaktif telah menjadi standar wajib bagi undangan digital kelas atas.'
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
        '## 1. Kirim secara Personal (Japri)',
        'Hindari membagikan tautan undangan secara massal di grup WhatsApp, terutama grup keluarga besar atau alumni sekolah, kecuali untuk kepentingan pengumuman umum. Kiriman japri terasa jauh lebih menghormati tamu.',
        '## 2. Personalisasi Nama Tamu',
        'Manfaatkan fitur personalisasi nama tamu dinamis yang disediakan InviteStudio. Dengan menambahkan nama tamu di akhir link (misalnya ?to=Nama+Tamu), tamu akan merasa dihargai secara eksklusif saat membuka undangan.',
        '## 3. Gunakan Template Pesan yang Sopan',
        'Mulailah pesan Anda dengan salam, permohonan maaf karena mengirimkan undangan secara digital (jika jarak menghalangi pertemuan langsung), perkenalkan diri beserta pasangan, cantumkan link undangan secara jelas, dan tutup dengan ungkapan terima kasih yang tulus.',
        '## 4. Perhatikan Waktu Pengiriman',
        'Kirimkan undangan Anda antara 2 hingga 4 minggu sebelum hari H. Mengirim terlalu cepat berisiko membuat tamu lupa, sedangkan mengirim terlalu dekat hari H membuat tamu sulit menyesuaikan jadwal mereka.'
      ],
      faqs: [
        { q: 'Kapan waktu terbaik untuk mengirimkan link undangan digital?', a: 'Idealnya adalah 2 hingga 4 minggu sebelum hari H acara pernikahan diselenggarakan.' },
        { q: 'Apakah boleh menyebarkan undangan digital lewat grup WA?', a: 'Sebaiknya hindari mengirim di grup untuk kerabat dekat atau senior. Mengirim secara personal (japri) jauh lebih sopan dan dihargai.' }
      ]
    },
    {
      slug: 'tutorial-membuat-undangan-digital-invitation-builder',
      title: 'Tutorial Lengkap: Cara Membuat Undangan Digital Sendiri di invitationbuilder.net',
      desc: 'Panduan langkah demi langkah cara merancang, mengedit, dan membagikan undangan pernikahan digital impian Anda menggunakan platform studio kreatif kami.',
      category: 'Tips & Panduan',
      readTime: '6 Menit',
      date: '10 Juli 2026',
      youtubeId: 'ZAFTEvRpktc',
      content: [
        'Membuat undangan pernikahan digital kini tidak lagi membutuhkan keahlian desain grafis atau pemrograman yang rumit. Dengan hadirnya platform invitationbuilder.net, Anda dapat membuat undangan digital sendiri secara instan, gratis, dan dengan kontrol kustomisasi penuh.',
        'Di dalam artikel panduan ini, kami telah menyusun tutorial langkah demi langkah beserta video panduan lengkap untuk membantu Anda merancang undangan pernikahan digital yang estetik dan tampak profesional.',
        '## Langkah 1: Kunjungi Catalog & Pilih Template',
        'Kunjungi halaman utama dan klik "Pilih Template" untuk melihat katalog desain kami. Kami menyediakan berbagai pilihan tema estetik, mulai dari tema pernikahan tradisional adat Jawa dengan ukiran batik heritage, nuansa modern emas putih luxury, hingga tema floral romantis alam terbuka.',
        '## Langkah 2: Edit Konten di Studio Editor',
        'Gunakan Panel Kanvas Editor Studio untuk menyesuaikan seluruh informasi penting. Anda bisa mengganti nama kedua mempelai, mengunggah foto prewedding terbaik Anda langsung dari HP, menyesuaikan agenda rundown acara, serta menentukan musik latar (backsound) lagu romantis pilihan Anda.',
        '## Langkah 3: Aktifkan Fitur Interaktif',
        'Tambahkan fitur-fitur interaktif seperti widget RSVP formulir kehadiran tamu, pengingat kalender digital, pencantuman peta lokasi (Google Maps pin), hingga fitur amplop angpao digital secara mandiri.',
        '## Langkah 4: Simpan & Bagikan Link Publik',
        'Setelah desain terasa sempurna, simpan proyek Anda. Anda kemudian dapat mempublikasikannya, menyalin tautan undangan kustom (misalnya menyisipkan nama tamu dinamis), dan menyebarkannya langsung via WhatsApp kepada kerabat serta seluruh tamu undangan Anda.'
      ],
      faqs: [
        { q: 'Apakah saya bisa mengubah musik latar dengan lagu sendiri?', a: 'Tentu saja! Di menu Widget/Music di sisi kiri editor, Anda dapat mengupload lagu/audio milik Anda sendiri atau menggunakan pilihan pustaka lagu romantis yang sudah kami sediakan.' },
        { q: 'Bagaimana cara mendapatkan link undangan setelah selesai mendesain?', a: 'Klik tombol "Simpan" di sudut kanan atas studio, isi data diri Anda, dan Anda akan langsung mendapatkan tautan link publik undangan Anda untuk disebarkan ke WhatsApp.' }
      ]
    }
  ];

  const activeArticle = articles.find(a => a.slug === selectedArticleSlug);

  // Dynamic Document Title and Meta Description for SEO & Browser Tabs
  useEffect(() => {
    if (activeArticle) {
      document.title = `${activeArticle.title} - Blog invitationbuilder.net`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', activeArticle.desc);
      }
    } else {
      document.title = 'Tips, Panduan & Inspirasi Pernikahan Digital - Blog invitationbuilder.net';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Pusat edukasi pernikahan digital terpercaya. Temukan tips membuat undangan digital, susunan acara resepsi, lagu romantis, hingga strategi hemat biaya nikah.');
      }
    }
  }, [activeArticle]);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
    window.history.pushState({}, '', `/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    setSelectedArticleSlug(null);
    window.history.pushState({}, '', '/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Categories list
  const categories = ['Semua', 'Tips & Panduan', 'Perencanaan', 'Anggaran & Logistik', 'Tren & Etnik', 'Inspirasi'];

  // Filtered articles
  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'Semua' || art.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#090c15] text-white font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090c15]/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={activeArticle ? handleBackToBlog : onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{activeArticle ? 'Kembali ke Katalog Blog' : 'Kembali ke Studio'}</span>
        </button>
        <div className="flex items-center space-x-1.5">
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
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-[10px] font-extrabold uppercase tracking-widest text-blue-400 rounded-lg">
                  {activeArticle.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight font-cinzel">
                {activeArticle.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-slate-500 text-[10px] font-bold">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Tim Spesialis InviteStudio</span>
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

            {/* Description Summary Callout */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-2xl text-xs text-slate-300 italic leading-relaxed">
              "{activeArticle.desc}"
            </div>

            {/* Article Content paragraphs */}
            <div className="space-y-5 text-sm text-slate-300 leading-relaxed font-light font-sans">
              {activeArticle.content.map((p, idx) => {
                if (p.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-base md:text-lg font-bold text-amber-400 font-cinzel pt-4 pb-1 border-b border-slate-900/60">
                      {p.replace('## ', '')}
                    </h2>
                  );
                }
                return <p key={idx}>{p}</p>;
              })}
            </div>

            {/* YouTube Embed Player */}
            {activeArticle.youtubeId && (
              <div className="my-6 aspect-video w-full rounded-2xl overflow-hidden border border-slate-900 shadow-2xl relative bg-slate-950">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeArticle.youtubeId}`}
                  title={activeArticle.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* FAQs Widget section */}
            {activeArticle.faqs && activeArticle.faqs.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-4">
                <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#D4AF37] flex items-center space-x-2 font-cinzel">
                  <Sparkles className="w-4 h-4" />
                  <span>Pertanyaan Umum (FAQ)</span>
                </h3>
                <div className="space-y-4">
                  {activeArticle.faqs.map((faq, i) => (
                    <div key={i} className="space-y-1.5 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-900">
                      <h4 className="font-extrabold text-white flex items-start space-x-1.5">
                        <span className="text-blue-400">Q:</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-slate-400 font-light leading-relaxed pl-5">
                        <strong className="text-amber-500 font-normal">A:</strong> {faq.a}
                      </p>
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
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Catalog Intro Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pusat Edukasi &amp; Tips Pernikahan Digital</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-cinzel">
                Artikel &amp; Panduan Pernikahan Digital
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Dapatkan tips persiapan pernikahan, susunan acara resepsi, strategi hemat biaya nikah, hingga rekomendasi lagu romantis dari tim spesialis InviteStudio.
              </p>
            </div>

            {/* Controls: Search & Category Filter Bar */}
            <div className="space-y-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari topik artikel (contoh: rsvp, lagu, anggaran, kata-kata)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List Grid */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs font-light">
                Tidak ada artikel yang cocok dengan pencarian Anda.
              </div>
            ) : (
              <div className="space-y-5">
                {filteredArticles.map((art) => (
                  <div 
                    key={art.slug}
                    onClick={() => handleArticleClick(art.slug)}
                    className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left group"
                  >
                    <div className="space-y-3.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px]">
                          {art.category}
                        </span>
                        <span>•</span>
                        <span>{art.date}</span>
                      </div>

                      <h2 className="text-base md:text-lg font-black text-white group-hover:text-blue-400 transition-colors font-cinzel leading-snug">
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}

