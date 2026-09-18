import { ApiEndpoint } from '../../../types';

export const aiGenerateEndpoint: ApiEndpoint = {
  id: 'ai-generate',
  name: 'AI Text & Code Generator',
  nameId: 'Generator Teks & Kode AI',
  category: 'ai',
  method: 'POST',
  path: '/api/ai/generate',
  summary: 'Generate intelligent text, explanations, or code with Gemini AI',
  summaryId: 'Hasilkan teks cerdas, penjelasan konsep, atau kode dengan AI',
  description: 'Processes prompt queries using server-side Gemini 3.7 Flash model with custom system instructions and temperature controls.',
  descriptionId: 'Memproses prompt query menggunakan model Gemini 3.7 Flash server-side dengan instruksi sistem kustom.',
  tags: ['AI', 'Gemini', 'Generator', 'LLM'],
  requestBodySample: {
    prompt: 'Jelaskan perbedaan REST API dan GraphQL dalam 3 poin ringkas.',
    systemInstruction: 'Jawab dengan bahasa Indonesia yang jelas, profesional, dan padat.',
    temperature: 0.7
  },
  responseSample: {
    success: true,
    provider: 'Google Gemini 3.7 Flash',
    prompt: 'Jelaskan perbedaan REST API dan GraphQL dalam 3 poin ringkas.',
    result: '1. Arsitektur: REST menggunakan multiple endpoint per resource, sedangkan GraphQL menggunakan single endpoint.\n2. Overfetching: REST mengembalikan fixed schema, sedangkan GraphQL client meminta field spesifik.\n3. Caching: REST memanfaatkan HTTP caching native (GET), GraphQL mengandalkan caching tingkat aplikasi.',
    usage: { estimatedTokens: 140 },
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
