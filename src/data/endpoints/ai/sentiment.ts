import { ApiEndpoint } from '../../../types';

export const aiSentimentEndpoint: ApiEndpoint = {
  id: 'ai-sentiment',
  name: 'Sentiment & Tone Analyzer',
  nameId: 'Analisis Sentimen & Nada Teks',
  category: 'ai',
  method: 'POST',
  path: '/api/ai/sentiment',
  summary: 'Analyze text sentiment polarity, mood, and confidence score',
  summaryId: 'Analisis polaritas sentimen teks, mood, dan skor keyakinan',
  description: 'Detects positive, negative, or neutral sentiment with keyword extraction and confidence score.',
  descriptionId: 'Mendeteksi sentimen positif, negatif, atau netral dengan ekstraksi kata kunci dan skor keyakinan.',
  tags: ['AI', 'NLP', 'Sentiment', 'Analytics'],
  requestBodySample: {
    text: 'Layanan REST API ini sangat cepat, responsif, dan dokumentasinya sangat mudah dipahami!'
  },
  responseSample: {
    success: true,
    text: 'Layanan REST API ini sangat cepat, responsif, dan dokumentasinya sangat mudah dipahami!',
    sentiment: 'Positive',
    confidenceScore: 0.95,
    polarity: 'positive',
    analysis: {
      positiveKeywords: ['cepat', 'responsif', 'mudah'],
      negativeKeywords: [],
      wordCount: 11,
      characterCount: 82
    },
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
