import { ApiEndpoint } from '../../../types';

export const nftokenEndpoint: ApiEndpoint = {
  id: 'tools-nftoken',
  name: 'Netflix NFToken Generator & Parser',
  nameId: 'Netflix NFToken Generator & Parser',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/nftoken',
  summary: 'Generate Netflix premium login tokens and device login links',
  summaryId: 'Generate token login Netflix premium dan tautan login multi-perangkat (PC, Mobile, TV)',
  description: 'Generates active Netflix login tokens automatically via NFToken service. Returns direct login links formatted for PC, Android, Smart TV, and TV8, including expiry date calculation and remaining duration.',
  descriptionId: 'Menghasilkan token login Netflix aktif secara otomatis via layanan NFToken. Mengembalikan tautan login langsung untuk PC, Android, Smart TV, dan TV8 lengkap dengan tanggal kadaluarsa dan sisa waktu.',
  tags: ['Tools', 'Netflix', 'NFToken', 'Generator', 'Premium', 'Account'],
  queryParams: [
    {
      name: 'action',
      type: 'string',
      required: false,
      description: 'Operation mode: "generate" (default), "batch" (generate multiple), or "links" (parse token links)',
      descriptionId: 'Mode operasi: "generate" (default), "batch" (generate banyak), atau "links" (buat link dari token)',
      defaultValue: 'generate'
    },
    {
      name: 'count',
      type: 'number',
      required: false,
      description: 'Batch count when action="batch" (1 to 5 tokens)',
      descriptionId: 'Jumlah token saat action="batch" (1 sampai 5 token)',
      defaultValue: 1
    },
    {
      name: 'token',
      type: 'string',
      required: false,
      description: 'Existing token string when action="links"',
      descriptionId: 'String token yang sudah ada saat action="links"',
      defaultValue: ''
    }
  ],
  responseSample: {
    success: true,
    action: 'generate',
    data: {
      success: true,
      token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im5ldGZsaXgtYXV0aC12MSJ9...',
      expiry: '25/09/2026, 18.30.00',
      remainingTime: '12j 45m 20d',
      profile: { country: 'ID', plan: 'Premium 4K Ultra HD' },
      links: {
        pc: 'https://netflix.com/?nftoken=eyJhbGci...',
        android: 'https://netflix.com/unsupported?nftoken=eyJhbGci...',
        tv: 'https://netflix.com/tv2?nftoken=eyJhbGci...',
        tv8: 'https://netflix.com/tv8?nftoken=eyJhbGci...'
      }
    },
    timestamp: '2026-09-13T03:45:00.000Z'
  }
};
