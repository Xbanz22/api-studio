import { ApiEndpoint } from '../../../types';

export const stalkTiktokEndpoint: ApiEndpoint = {
  id: 'tools-stalktiktok',
  name: 'TikTok Profile Stalker',
  nameId: 'TikTok Profil Stalker & Info',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/stalktiktok',
  summary: 'Stalk any TikTok profile, stats, bio, verified badge & recent videos',
  summaryId: 'Stalking profil TikTok publik, statistik followers, likes, bio & video terbaru',
  description: 'Extracts public TikTok profile data including nickname, avatar, bio, follower count, total hearts, verified status, and recent video covers.',
  descriptionId: 'Mengekstrak data profil publik TikTok seperti username, avatar HD, bio, total followers, jumlah likes, status centang biru, dan thumbnail video terbaru.',
  tags: ['Tools', 'TikTok', 'Stalker', 'Social Media', 'Lookup'],
  queryParams: [
    { name: 'username', type: 'string', required: true, defaultValue: 'khaby.lame', description: 'TikTok username without @', descriptionId: 'Username TikTok tanpa simbol @' },
    { name: 'include_videos', type: 'boolean', defaultValue: true, description: 'Include recent video list and view counts', descriptionId: 'Sertakan daftar video terbaru dan total views' }
  ],
  responseSample: {
    success: true,
    username: 'khaby.lame',
    data: {
      user: {
        id: '1092837492',
        username: 'khaby.lame',
        nickname: 'Khaby Lame',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=khaby.lame',
        signature: 'If u wanna laugh u are in the right place 😎',
        verified: true,
        region: 'IT'
      },
      stats: {
        followerCount: 162800000,
        followingCount: 78,
        heartCount: 2400000000,
        videoCount: 1240,
        formattedFollowers: '162.8M',
        formattedHearts: '2.4B'
      }
    },
    meta: {
      serverTimestamp: '2026-09-15T08:00:00.000Z',
      source: 'TikTok Stalker Engine v2.0',
      processingTimeMs: 18
    }
  }
};
