export interface ManageableEndpoint {
  path: string;
  name: string;
  category: 'ai' | 'tools' | 'data' | 'keys' | 'system' | 'analytics';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  desc: string;
}

export const ALL_MANAGEABLE_ENDPOINTS: ManageableEndpoint[] = [
  // 1. AI & Machine Learning
  {
    path: '/api/ai/generate',
    name: 'AI Text & Code Generator',
    category: 'ai',
    method: 'POST',
    desc: 'Hasilkan teks cerdas, analisis logika, atau kode program menggunakan Gemini Flash server-side.'
  },
  {
    path: '/api/ai/sentiment',
    name: 'Sentiment & Tone Analyzer',
    category: 'ai',
    method: 'POST',
    desc: 'Analisis polaritas sentimen kalimat (positif/negatif/netral), mood, dan skor keyakinan NLP.'
  },
  {
    path: '/api/ai/translate',
    name: 'Multi-Language Translator',
    category: 'ai',
    method: 'POST',
    desc: 'Terjemahkan teks antar bahasa dunia dengan preservasi konteks kultural dan gramatikal.'
  },

  // 2. Utilities, Tools & Scrapers
  {
    path: '/api/tools/qr',
    name: 'QR Code Generator',
    category: 'tools',
    method: 'GET',
    desc: 'Hasilkan gambar QR Code berkualitas tinggi secara instan dari input teks atau URL tujuan.'
  },
  {
    path: '/api/tools/uuid',
    name: 'UUID & Unique ID Generator',
    category: 'tools',
    method: 'GET',
    desc: 'Generate batch identifier unik yang aman (UUID v4, NanoID, ShortID, Hexadecimal).'
  },
  {
    path: '/api/tools/hash',
    name: 'Cryptographic Hasher & Base64',
    category: 'tools',
    method: 'POST',
    desc: 'Hash string ke MD5, SHA-256, SHA-512, serta fungsi encode/decode Base64.'
  },
  {
    path: '/api/tools/password',
    name: 'Strong Password Generator',
    category: 'tools',
    method: 'GET',
    desc: 'Hasilkan kata sandi acak dengan level entropi tinggi, simbol, dan panjang kustom.'
  },
  {
    path: '/api/tools/ip-lookup',
    name: 'IP & Client Inspector',
    category: 'tools',
    method: 'GET',
    desc: 'Periksa detail IP publik, ISP penyedia, lokasi server geografis, dan user-agent header.'
  },
  {
    path: '/api/tools/scrape',
    name: 'Web Scraper & Metadata Extractor',
    category: 'tools',
    method: 'POST',
    desc: 'Scrape struktur HTML halaman web eksternal, tag OpenGraph, meta description, heading, dan link.'
  },
  {
    path: '/api/tools/tiktok',
    name: 'TikTok Video & Slide Downloader',
    category: 'tools',
    method: 'GET',
    desc: 'Ambil link unduhan video TikTok tanpa watermark dan galeri foto/slide resolusi asli.'
  },
  {
    path: '/api/tools/stalktiktok',
    name: 'TikTok Profile Stalker',
    category: 'tools',
    method: 'GET',
    desc: 'Inspeksi metadata profil publik TikTok, bio, statistik followers, likes, dan status verifikasi.'
  },
  {
    path: '/api/tools/pinterest',
    name: 'Pinterest Scraper & Pin Search',
    category: 'tools',
    method: 'GET',
    desc: 'Cari koleksi pinboard dan gambar inspirasi Pinterest resolusi tinggi berdasarkan kata kunci.'
  },
  {
    path: '/api/tools/nftoken',
    name: 'Netflix NFToken Generator & Parser',
    category: 'tools',
    method: 'GET',
    desc: 'Hasilkan token session otentikasi Netflix untuk keperluan integrasi bot automation.'
  },

  // 3. Data Sandbox & Mock CRUD Feed
  {
    path: '/api/data/users',
    name: 'Dummy Users Feed & CRUD',
    category: 'data',
    method: 'GET',
    desc: 'Penyedia data pengguna simulasi dengan query pencarian, filter role, dan paginasi.'
  },
  {
    path: '/api/data/users/:id',
    name: 'Single Dummy User Detail & Modify',
    category: 'data',
    method: 'GET',
    desc: 'Ambil detail lengkap, modifikasi (PUT), atau hapus (DELETE) entitas pengguna simulasi.'
  },
  {
    path: '/api/data/products',
    name: 'Dummy Products Catalog',
    category: 'data',
    method: 'GET',
    desc: 'Katalog produk e-commerce simulasi lengkap dengan harga rupiah, rating, stok, dan tag.'
  },
  {
    path: '/api/data/quotes',
    name: 'Inspiration Quotes Generator',
    category: 'data',
    method: 'GET',
    desc: 'Ambil daftar kutipan motivasi, inspirasi harian, dan filosofi dari database sandbox.'
  },
  {
    path: '/api/data/weather',
    name: 'Dynamic Weather Feed',
    category: 'data',
    method: 'GET',
    desc: 'Simulasi data cuaca regional dinamis, suhu celcius, kondisi langit, dan kelembaban udara.'
  },
  {
    path: '/api/data/currency',
    name: 'Sandbox Currency Converter',
    category: 'data',
    method: 'GET',
    desc: 'Indeks konversi mata uang global real-time (USD, IDR, EUR, JPY, SGD) untuk pengujian sistem.'
  },

  // 4. API Key Management
  {
    path: '/api/keys/check',
    name: 'API Key & Limit Status Checker',
    category: 'keys',
    method: 'GET',
    desc: 'Pemeriksaan status aktif API Key, limit panggilan per menit, dan sisa kuota bulanan.'
  },
  {
    path: '/api/keys/list',
    name: 'List Active API Keys',
    category: 'keys',
    method: 'GET',
    desc: 'Daftar seluruh API Key aktif yang terdaftar di sistem untuk monitoring dan audit kepemilikan.'
  },
  {
    path: '/api/keys/generate',
    name: 'Generate New API Key',
    category: 'keys',
    method: 'POST',
    desc: 'Buat kredensial API Key baru dengan penetapan nama aplikasi, tier lisensi, dan limit kuota.'
  },

  // 5. System Health & Documentation
  {
    path: '/api/status',
    name: 'Server Health & Telemetry Metrics',
    category: 'system',
    method: 'GET',
    desc: 'Telemetri runtime server real-time: uptime, konsumsi memori, latency, dan kesehatan gateway.'
  },
  {
    path: '/api/docs/openapi.json',
    name: 'OpenAPI v3.0 Specification JSON',
    category: 'system',
    method: 'GET',
    desc: 'Spesifikasi kontrak OpenAPI/Swagger 3.0 standar untuk integrasi Postman dan client generator.'
  },

  // 6. Administration, Ingress & Analytics
  {
    path: '/api/analytics/stats',
    name: 'System Summary Stats',
    category: 'analytics',
    method: 'GET',
    desc: 'Metrik agregat traffic, total requests, kuota pemakaian, dan rasio status HTTP sukses.'
  },
  {
    path: '/api/analytics/logs',
    name: 'Recent Request Audit Trails',
    category: 'analytics',
    method: 'GET',
    desc: 'Daftar riwayat log request-response mentah sistem untuk audit keamanan dan investigasi eror.'
  },
  {
    path: '/api/webhooks/history',
    name: 'Webhook Ingress Logs',
    category: 'analytics',
    method: 'GET',
    desc: 'Riwayat pengiriman payload event webhook eksternal yang masuk ke gateway sistem.'
  },
  {
    path: '/api/speedtest/regions',
    name: 'Regional Latency Indexer',
    category: 'analytics',
    method: 'GET',
    desc: 'Uji latency responsivitas server global dari berbagai regional CDN edge network.'
  }
];
