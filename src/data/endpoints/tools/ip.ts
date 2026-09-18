import { ApiEndpoint } from '../../../types';

export const ipEndpoint: ApiEndpoint = {
  id: 'tools-ip',
  name: 'IP & Client Inspector',
  nameId: 'Inspeksi IP & Client',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/ip-lookup',
  summary: 'Inspect caller IP, protocol, user agent, and request headers',
  summaryId: 'Inspeksi IP pemanggil, protokol, user agent, dan header request',
  description: 'Echoes back client network connection details, proxy headers, and incoming client attributes.',
  descriptionId: 'Mengembalikan detail koneksi jaringan client, header proxy, dan atribut request.',
  tags: ['Tools', 'Network', 'IP', 'Inspector'],
  responseSample: {
    success: true,
    ip: '114.122.18.94',
    protocol: 'https',
    secure: true,
    host: 'rest-api-hub.app',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    serverRegion: 'Google Cloud Platform (Asia / Global CDN)',
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
