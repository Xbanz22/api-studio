export interface CategoryInfo {
  id: string;
  nameEn: string;
  nameId: string;
  descriptionEn: string;
  descriptionId: string;
  icon: string;
  count: number;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'ai',
    nameEn: 'AI & Intelligence',
    nameId: 'AI & Kecerdasan Buatan',
    descriptionEn: 'Gemini AI generation, sentiment analyzer, multi-language translation',
    descriptionId: 'Gemini AI generator, analisis sentimen, penerjemah multi-bahasa',
    icon: 'Sparkles',
    count: 3,
    color: 'indigo'
  },
  {
    id: 'tools',
    nameEn: 'Utilities & Tools',
    nameId: 'Tools & Utilitas',
    descriptionEn: 'TikTok & Pinterest scrapers, QR generator, Netflix token, password, hashes',
    descriptionId: 'Scraper TikTok & Pinterest, QR code, Netflix token, generator password, hash',
    icon: 'Wrench',
    count: 10,
    color: 'emerald'
  },
  {
    id: 'data',
    nameEn: 'Data & Mock CRUD',
    nameId: 'Data & Mock CRUD',
    descriptionEn: 'User CRUD, e-commerce products, live weather, currency converter',
    descriptionId: 'CRUD User, produk e-commerce, cuaca live, konverter mata uang',
    icon: 'Database',
    count: 8,
    color: 'cyan'
  },
  {
    id: 'keys',
    nameEn: 'API Key Management',
    nameId: 'Manajemen API Key',
    descriptionEn: 'Quota status checker, rate limit metrics, key generator',
    descriptionId: 'Cek sisa limit API key, metrik kuota, generator key baru',
    icon: 'Key',
    count: 3,
    color: 'amber'
  },
  {
    id: 'system',
    nameEn: 'System & Health',
    nameId: 'Sistem & Status',
    descriptionEn: 'Server health metrics, uptime telemetry, OpenAPI 3.0 specs',
    descriptionId: 'Metrik kesehatan server, telemetri uptime, spesifikasi OpenAPI 3.0',
    icon: 'Activity',
    count: 2,
    color: 'rose'
  },
  {
    id: 'mock',
    nameEn: 'Custom Mock APIs',
    nameId: 'Mock API Kustom',
    descriptionEn: 'User-created custom endpoints and dynamic mock responses',
    descriptionId: 'Endpoint kustom buatan pengguna dan respons mock dinamis',
    icon: 'Code2',
    count: 0,
    color: 'purple'
  }
];
