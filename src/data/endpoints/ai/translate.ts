import { ApiEndpoint } from '../../../types';

export const aiTranslateEndpoint: ApiEndpoint = {
  id: 'ai-translate',
  name: 'Multi-Language Translator',
  nameId: 'Penerjemah Multi Bahasa',
  category: 'ai',
  method: 'POST',
  path: '/api/ai/translate',
  summary: 'Translate text between Indonesian, English, Japanese, and others',
  summaryId: 'Terjemahkan teks antara Bahasa Indonesia, Inggris, Jepang, dll',
  description: 'Automated natural language translation engine with auto-detection of source language.',
  descriptionId: 'Mesin penerjemahan bahasa otomatis dengan deteksi otomatis bahasa sumber.',
  tags: ['AI', 'Translation', 'Languages'],
  requestBodySample: {
    text: 'Selamat pagi! REST API ini sangat membantu pengembangan aplikasi web saya.',
    targetLang: 'en'
  },
  responseSample: {
    success: true,
    originalText: 'Selamat pagi! REST API ini sangat membantu pengembangan aplikasi web saya.',
    sourceLanguage: 'auto-detect (Indonesian)',
    targetLanguage: 'en',
    translatedText: 'Good morning! This REST API really helps my web application development.',
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
