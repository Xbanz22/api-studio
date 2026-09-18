import { ApiEndpoint } from '../../../types';

export const keysCreateEndpoint: ApiEndpoint = {
  id: 'keys-create',
  name: 'Generate New API Key',
  nameId: 'Buat API Key Baru',
  category: 'keys',
  method: 'POST',
  path: '/api/keys/generate',
  summary: 'Create a new API Key with tier and rate limit allocation',
  summaryId: 'Buat API Key baru dengan alokasi tier dan batas rate limit',
  description: 'Generates a unique API token with rate limits and quota tracking (Free, Pro, or Enterprise).',
  descriptionId: 'Menghasilkan token API baru dengan kuota request sesuai tier yang dipilih.',
  tags: ['Auth', 'Keys', 'Generator'],
  requestBodySample: {
    name: 'Staging Server Key',
    tier: 'Pro'
  },
  responseSample: {
    success: true,
    message: 'API Key berhasil dibuat!',
    data: {
      key: 'api_pro_e847c92b8d7124f901ab',
      name: 'Staging Server Key',
      tier: 'Pro',
      rateLimit: 300,
      requestCount: 0,
      totalLimit: 25000,
      createdAt: '2026-08-31T21:30:00.000Z'
    }
  }
};
