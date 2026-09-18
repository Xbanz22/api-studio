import { ApiEndpoint } from '../../../types';

export const netflixEndpoint: ApiEndpoint = {
  id: 'tools-netflix',
  name: 'Netflix Catalog & Account Inspector',
  nameId: 'Netflix Katalog & Info Akun',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/netflix',
  summary: 'Search Netflix movies, series, pricing plans, server status & session validation',
  summaryId: 'Cari film/serial Netflix, daftar paket harga, status server & validasi sesi akun',
  description: 'Provides comprehensive Netflix title discovery, movie metadata, regional pricing plans, streaming quality badges, and session cookie validation.',
  descriptionId: 'Menyediakan pencarian katalog Netflix lengkap, metadata judul film, harga paket regional, badge kualitas streaming 4K HDR, dan validasi cookie sesi.',
  tags: ['Tools', 'Netflix', 'Streaming', 'Movies', 'Media'],
  queryParams: [
    { name: 'action', type: 'enum', defaultValue: 'search', options: ['search', 'plans', 'status', 'check_cookie'], description: 'Action mode: search catalog, view subscription plans, or check service status', descriptionId: 'Mode aksi: search (cari katalog), plans (paket harga), status (kesehatan server), check_cookie' },
    { name: 'query', type: 'string', defaultValue: 'Stranger Things', description: 'Movie or series title to search (for action=search)', descriptionId: 'Judul film atau serial yang dicari' },
    { name: 'region', type: 'string', defaultValue: 'ID', description: 'Country region code (ID, US, SG, JP)', descriptionId: 'Kode negara regional (ID, US, SG, JP)' }
  ],
  responseSample: {
    success: true,
    action: 'search',
    query: 'Stranger Things',
    region: 'ID',
    totalResults: 1,
    data: [
      {
        id: 'nflx-80057281',
        title: 'Stranger Things',
        type: 'TV Series',
        releaseYear: 2016,
        rating: '16+',
        imdbScore: 8.7,
        matchScore: '98% Match',
        seasons: 4,
        genres: ['Sci-Fi', 'Drama', 'Horror', 'Mystery'],
        cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
        synopsis: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments...',
        qualities: ['4K Ultra HD', 'Dolby Vision', 'Dolby Atmos 5.1'],
        netflixUrl: 'https://www.netflix.com/title/80057281'
      }
    ],
    meta: {
      region: 'ID',
      serverTimestamp: '2026-09-15T08:00:00.000Z',
      source: 'Netflix Catalog Indexer',
      processingTimeMs: 12
    }
  }
};
