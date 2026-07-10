/**
 * IndexNow URL Submission Script
 * Submit semua halaman penting ke Bing, Yandex via protokol IndexNow
 * 
 * Cara pakai:
 *   node scripts/submit-indexnow.js
 *
 * IndexNow Docs: https://www.indexnow.org/documentation
 */

const https = require('https');

const INDEXNOW_KEY = '5a8c3bdbe5951f6569aeed032cff0984';
const HOST = 'www.invitationbuilder.net';
const BASE_URL = 'https://www.invitationbuilder.net';

// Daftar URL penting yang ingin diindeks
const urlList = [
  `${BASE_URL}/`,
  `${BASE_URL}/templates`,
  `${BASE_URL}/blog`,
  `${BASE_URL}/blog/cara-membuat-undangan-digital`,
];

// Submit ke Bing IndexNow (otomatis dishare ke Yandex & search engine lain)
const payload = JSON.stringify({
  host: HOST,
  key: INDEXNOW_KEY,
  keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
  urlList: urlList,
});

const options = {
  hostname: 'api.indexnow.org',
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  },
};

console.log(`\n📡 Submitting ${urlList.length} URLs ke IndexNow...\n`);
urlList.forEach(url => console.log(`  ✓ ${url}`));
console.log();

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);

  if (res.statusCode === 200) {
    console.log('✅ Berhasil! Semua URL sudah dikirim ke IndexNow.');
    console.log('   Bing, Yandex, dan search engine lain akan segera mengindeks URL Anda.');
  } else if (res.statusCode === 202) {
    console.log('✅ Diterima! IndexNow sedang memvalidasi key Anda.');
  } else if (res.statusCode === 400) {
    console.log('❌ Bad Request: Format tidak valid. Periksa urlList.');
  } else if (res.statusCode === 403) {
    console.log('❌ Forbidden: Key tidak valid. Pastikan file key.txt sudah online.');
    console.log(`   Cek: ${BASE_URL}/${INDEXNOW_KEY}.txt`);
  } else if (res.statusCode === 422) {
    console.log('❌ URL tidak cocok dengan host yang didaftarkan.');
  } else if (res.statusCode === 429) {
    console.log('⚠️  Too Many Requests. Coba lagi nanti.');
  }
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(payload);
req.end();
