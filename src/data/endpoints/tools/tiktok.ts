import { ApiEndpoint } from '../../../types';

export const tiktokDownloaderEndpoint: ApiEndpoint = {
  id: 'tools-tiktok',
  name: 'TikTok Video & Slide Downloader',
  nameId: 'TikTok Video & Slide Downloader',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/tiktok',
  summary: 'Extract TikTok MP4 Video or Image Slide URLs without watermark',
  summaryId: 'Unduh video MP4 tanpa watermark dan foto slide TikTok',
  description: 'Scrapes TikTok video or image slide posts directly. Extracts direct MP4 download links, high-res image lists, sound/music audio link, author metrics, and post statistics (likes, shares, views, comments).',
  descriptionId: 'Mengekstrak postingan video atau foto slide TikTok secara langsung. Mengambil link download MP4 tanpa watermark, daftar gambar resolusi tinggi, audio musik, data author, dan statistik postingan.',
  tags: ['Tools', 'TikTok', 'Downloader', 'Video', 'Slide', 'No-Watermark', 'Scraper'],
  queryParams: [
    {
      name: 'url',
      type: 'string',
      required: true,
      description: 'TikTok video or image slide URL (e.g. https://vt.tiktok.com/ZSqJGDDKP/ or https://www.tiktok.com/@user/video/123)',
      descriptionId: 'URL postingan video atau slide foto TikTok (contoh: https://vt.tiktok.com/ZSqJGDDKP/)',
      defaultValue: 'https://vt.tiktok.com/ZSqJGDDKP/'
    }
  ],
  responseSample: {
    success: true,
    data: {
      id: '72839482910293849',
      isVideo: true,
      type: 'video',
      title: 'Video TikTok Keren #fyp #viral',
      region: 'ID',
      duration: '15 second',
      cover: 'https://p16-sign-va.tiktokcdn.com/obj/tos-useast2a-p-0037/...',
      stats: {
        like: 15420,
        likeFormatted: '15.4K',
        views: 248000,
        viewsFormatted: '248.0K',
        share: 3200,
        shareFormatted: '3.2K',
        comment: 890,
        commentFormatted: '890',
        collect: 4120,
        collectFormatted: '4.1K'
      },
      download: [
        'https://v16-webapp-prime.tiktok.com/video/tos/useast2a/v/...',
        'https://www.tiktok.com/play/v1/...'
      ],
      author: {
        id: '6789123456',
        username: 'creator_tiktok',
        nickname: 'Creator TikTok',
        avatar: 'https://p16-sign-va.tiktokcdn.com/avatar/...',
        verified: true,
        followers: 125000,
        following: 340,
        like: 1200000,
        videoCount: 88
      },
      music: {
        id: '6789123456789',
        title: 'Original Sound',
        author: 'Creator TikTok',
        thumbnail: 'https://p16-sign-va.tiktokcdn.com/music/...',
        duration: '15 second',
        url: 'https://sf16-ies-music.tiktokcdn.com/obj/tos-useast2a-ve-0068/...'
      }
    },
    timestamp: '2026-09-13T03:55:00.000Z'
  }
};
