import { ApiEndpoint } from '../../../types';

export const keysListEndpoint: ApiEndpoint = {
  id: 'keys-list',
  name: 'List Active API Keys',
  nameId: 'Daftar API Key Aktif',
  category: 'keys',
  method: 'GET',
  path: '/api/keys/list',
  summary: 'View all registered API keys and quota usages',
  summaryId: 'Lihat semua API key terdaftar dan penggunaan kuotanya',
  description: 'Returns all generated API keys with tier limits, request counters, and creation timestamps.',
  descriptionId: 'Mengembalikan daftar API key terdaftar beserta kuota dan jumlah request.',
  tags: ['Auth', 'Keys', 'Security'],
  responseSample: {
    success: true,
    total: 1,
    data: [
      {
        key: 'api_pro_9876543210fedcba',
        name: 'Production Mobile App',
        tier: 'Pro',
        rateLimit: 300,
        requestCount: 42,
        totalLimit: 25000,
        createdAt: '2026-08-30T10:00:00.000Z'
      }
    ]
  }
};
