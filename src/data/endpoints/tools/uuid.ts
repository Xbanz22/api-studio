import { ApiEndpoint } from '../../../types';

export const uuidEndpoint: ApiEndpoint = {
  id: 'tools-uuid',
  name: 'UUID & Unique ID Generator',
  nameId: 'Generator UUID & ID Unik',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/uuid',
  summary: 'Generate UUID v4, NanoID, ShortID, or Hex keys',
  summaryId: 'Hasilkan kunci UUID v4, NanoID, ShortID, atau Hex acak',
  description: 'Batch-generate cryptographically secure identifiers suitable for database keys, tracking tokens, and session IDs.',
  descriptionId: 'Generate pengenal acak aman untuk primary key database, tracking token, dan ID sesi.',
  tags: ['Tools', 'UUID', 'Security', 'Tokens'],
  queryParams: [
    { name: 'count', type: 'number', defaultValue: 3, description: 'Number of IDs to generate (1 - 50)', descriptionId: 'Jumlah ID yang ingin dibuat (1 - 50)' },
    { name: 'type', type: 'enum', defaultValue: 'v4', options: ['v4', 'nanoid', 'shortId', 'hex'], description: 'Algorithm type', descriptionId: 'Jenis algoritma identifier' }
  ],
  responseSample: {
    success: true,
    type: 'v4',
    count: 3,
    data: [
      'e7b23f81-817a-4c22-9217-0f81d1134a62',
      '28b9d311-657c-48c9-bcfa-192a832bc9d0',
      '88ff01ae-9a72-4d51-83d2-c48f2b74fa31'
    ],
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
