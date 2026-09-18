import { ApiEndpoint } from '../../../types';

export const pinterestEndpoint: ApiEndpoint = {
  id: 'tools-pinterest',
  name: 'Pinterest Scraper & Pin Search',
  nameId: 'Pinterest Scraper & Pencari Pin',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/pinterest',
  summary: 'Search and scrape Pinterest pins, titles, image links, author, and likes',
  summaryId: 'Cari dan scrape pin Pinterest, gambar beresolusi tinggi, penulis, dan statistik like',
  description: 'Searches Pinterest pins in real-time by keyword or theme. Extracts high-resolution pin image URLs, source links, likes count, repin count, and creator information.',
  descriptionId: 'Mencari pin Pinterest secara real-time berdasarkan kata kunci atau tema. Mengambil URL gambar resolusi tinggi, tautan sumber pin, jumlah suka, dan profil kreator.',
  tags: ['Tools', 'Pinterest', 'Scraper', 'Media', 'Search', 'Image'],
  queryParams: [
    {
      name: 'q',
      type: 'string',
      required: true,
      description: 'Search keyword for Pinterest pins (e.g. aesthetic wallpaper, anime outfit, desk setup)',
      descriptionId: 'Kata kunci pencarian pin Pinterest (contoh: aesthetic wallpaper, anime outfit, cat meme)',
      defaultValue: 'aesthetic wallpaper'
    },
    {
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Maximum number of pins to fetch (1 - 30)',
      descriptionId: 'Jumlah maksimal pin yang ditarik (1 - 30)',
      defaultValue: 12
    }
  ],
  responseSample: {
    success: true,
    query: 'aesthetic wallpaper',
    total: 2,
    source: 'Pinterest Media & Pin Search Engine',
    sourceUrl: 'https://www.pinterest.com/search/pins/?q=aesthetic%20wallpaper',
    data: [
      {
        id: 'pin_8923412',
        title: 'Aesthetic Wallpaper Inspiration #1',
        description: 'Ide dan estetika pin untuk pencarian "aesthetic wallpaper". Ditemukan di Pinterest.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        pinUrl: 'https://www.pinterest.com/pin/8923412/',
        author: '@aesthetic_creator',
        likes: 245,
        repinCount: 88
      }
    ],
    timestamp: '2026-09-04T12:00:00.000Z'
  }
};
