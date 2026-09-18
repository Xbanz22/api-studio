import { ApiEndpoint } from '../../../types';

export const scrapeEndpoint: ApiEndpoint = {
  id: 'tools-scrape',
  name: 'Web Scraper & Metadata Extractor',
  nameId: 'Web Scraper & Ekstraktor Metadata',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/scrape',
  summary: 'Scrape HTML pages, retrieve metadata, headings, and extracted outbound links',
  summaryId: 'Scrape halaman HTML, ambil metadata, heading, dan link keluar terdeteksi',
  description: 'Performs real-time server-side fetching of any specified target web page, parses metadata headers, Open Graph tags, structured headers, and clean page snippets. Supports both GET (?url=...) and POST (JSON body).',
  descriptionId: 'Melakukan penarikan data halaman web eksternal secara real-time dari server, mem-parse metadata, tag Open Graph, struktur header, dan cuplikan teks bersih. Mendukung method GET (?url=...) maupun POST (JSON body).',
  tags: ['Tools', 'Scraper', 'SEO', 'Data Miner'],
  queryParams: [
    {
      name: 'url',
      type: 'string',
      required: true,
      description: 'Target website URL (e.g. https://example.com)',
      descriptionId: 'URL website tujuan (misal https://example.com)',
      defaultValue: 'https://example.com'
    }
  ],
  responseSample: {
    success: true,
    url: 'https://example.com',
    metadata: {
      title: 'Example Domain',
      description: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
      keywords: '',
      og: { title: '', image: '', type: '' }
    },
    structure: {
      headings: { h1: ['Example Domain'], h2: [] },
      detectedLinksCount: 1,
      links: ['https://www.iana.org/domains/reserved']
    },
    contentStats: {
      rawLengthBytes: 1256,
      approximateWordCount: 42,
      snippet: 'Example Domain This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission. More information...'
    }
  }
};
