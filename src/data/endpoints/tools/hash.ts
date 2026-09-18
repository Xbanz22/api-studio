import { ApiEndpoint } from '../../../types';

export const hashEndpoint: ApiEndpoint = {
  id: 'tools-hash',
  name: 'Cryptographic Hasher & Base64',
  nameId: 'Hasher Kriptografi & Base64',
  category: 'tools',
  method: 'POST',
  path: '/api/tools/hash',
  summary: 'Calculate SHA256, SHA512, MD5, or Base64 encoding',
  summaryId: 'Hitung hash SHA256, SHA512, MD5, atau encode/decode Base64',
  description: 'Transforms string inputs into one-way cryptographic hash digests or reversible Base64 representations.',
  descriptionId: 'Mengubah string input menjadi hash kriptografi atau representasi Base64.',
  tags: ['Tools', 'Crypto', 'Hashing', 'Security'],
  requestBodySample: {
    text: 'MySecurePassword2026!',
    algorithm: 'sha256'
  },
  responseSample: {
    success: true,
    inputText: 'MySecurePassword2026!',
    algorithm: 'sha256',
    output: '9b8769a4a742959a2d0298c36fb7064bd9f0c04447d56a64e3451a920116508a',
    length: 64,
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
