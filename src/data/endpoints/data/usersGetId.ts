import { ApiEndpoint } from '../../../types';

export const dataUsersGetIdEndpoint: ApiEndpoint = {
  id: 'data-users-get-id',
  name: 'Get User by ID',
  nameId: 'Ambil Pengguna Berdasarkan ID',
  category: 'data',
  method: 'GET',
  path: '/api/data/users/usr_1',
  summary: 'Retrieve single user profile by specific ID',
  summaryId: 'Ambil profil satu pengguna berdasarkan ID',
  description: 'Finds and returns a single user entity matching the provided ID path parameter.',
  descriptionId: 'Mencari dan mengembalikan satu entitas pengguna yang cocok dengan ID pada path URL.',
  tags: ['Data', 'Users', 'CRUD'],
  responseSample: {
    success: true,
    data: {
      id: 'usr_1',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@example.com',
      role: 'Admin',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2026-01-15T08:30:00Z'
    }
  }
};
