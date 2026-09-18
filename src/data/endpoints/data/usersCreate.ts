import { ApiEndpoint } from '../../../types';

export const dataUsersCreateEndpoint: ApiEndpoint = {
  id: 'data-users-create',
  name: 'Create User Record',
  nameId: 'Tambah Pengguna Baru',
  category: 'data',
  method: 'POST',
  path: '/api/data/users',
  summary: 'Add a new user object to the database',
  summaryId: 'Menambahkan data pengguna baru ke database',
  description: 'Accepts user parameters and appends a newly generated user object to the in-memory store with 201 Created status.',
  descriptionId: 'Menerima parameter pengguna dan membuat objek baru dengan status 201 Created.',
  tags: ['Data', 'Users', 'CRUD', 'POST'],
  requestBodySample: {
    name: 'Rizky Pratama',
    email: 'rizky.pratama@dev.id',
    role: 'Developer',
    status: 'Active'
  },
  responseSample: {
    success: true,
    message: 'User berhasil dibuat',
    data: {
      id: 'usr_981a',
      name: 'Rizky Pratama',
      email: 'rizky.pratama@dev.id',
      role: 'Developer',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791?w=150',
      createdAt: '2026-08-31T21:30:00.000Z'
    }
  }
};
