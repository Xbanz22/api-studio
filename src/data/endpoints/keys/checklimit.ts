import { ApiEndpoint } from '../../../types';

export const keysCheckLimitEndpoint: ApiEndpoint = {
  id: 'tools-checklimit',
  name: 'API Key & Rate Limit Status Checker',
  nameId: 'Cek Status Sisa Limit API Key',
  category: 'keys',
  method: 'GET',
  path: '/api/keys/check',
  summary: 'Check API Key remaining quota, tier, and minute/day rate limits',
  summaryId: 'Cek sisa kuota, status tier, dan rate limit per menit/hari dari API Key',
  description: 'Returns real-time consumption metrics for an API Key, including total requests used, remaining quota, tier configuration, minute rate limits, and IP/Origin whitelists.',
  descriptionId: 'Mengembalikan metrik konsumsi real-time untuk API Key, meliputi sisa kuota request, status tier, rate limit per menit, per hari, dan whitelist IP.',
  tags: ['API Key', 'Rate Limit', 'Quota', 'Bot Checker', 'Metrics', 'Status'],
  queryParams: [
    {
      name: 'apikey',
      type: 'string',
      required: true,
      description: 'Your API Key to inspect (e.g. sk_live_demo123)',
      descriptionId: 'API Key yang ingin dicek limitnya (contoh: sk_live_demo123)',
      defaultValue: 'sk_live_demo123'
    }
  ],
  responseSample: {
    success: true,
    data: {
      key: 'sk_live_demo123',
      name: 'Bot WhatsApp Key',
      ownerEmail: 'user@example.com',
      tier: 'Free',
      status: 'active',
      usage: {
        requestCount: 42,
        totalLimit: 1000,
        remainingTotalRequests: 958,
        percentUsed: 4
      },
      rateLimits: {
        perMinute: { limit: 60, used: 3, remaining: 57 },
        perDay: { limit: 1000, used: 42, remaining: 958 },
        perMonth: { limit: 30000, used: 42, remaining: 29958 }
      },
      created: '2026-01-01T00:00:00.000Z',
      expiresAt: 'Never'
    },
    timestamp: '2026-09-13T04:28:00.000Z'
  }
};
