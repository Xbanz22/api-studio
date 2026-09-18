import { ApiEndpoint } from '../../../types';

export const dataUsersUpdateEndpoint: ApiEndpoint = {
  id: 'data-users-update',
  name: 'Update User by ID',
  nameId: 'Perbarui Pengguna Berdasarkan ID',
  category: 'data',
  method: 'PUT',
  path: '/api/data/users/usr_1',
  summary: 'Update existing user profile fields',
  summaryId: 'Perbarui field pada profil pengguna yang ada',
  description: 'Updates specified fields for the matching user record.',
  descriptionId: 'Memperbarui field yang ditentukan untuk record pengguna terkait.',
  tags: ['Data', 'Users', 'CRUD', 'PUT'],
  requestBodySample: {
    name: 'Ahmad Fauzi, M.Kom',
    role: 'Lead Architect',
    status: 'Active'
  },
  responseSample: {
    success: true,
    message: 'User berhasil diperbarui',
    data: {
      id: 'usr_1',
      name: 'Ahmad Fauzi, M.Kom',
      email: 'ahmad.fauzi@example.com',
      role: 'Lead Architect',
      status: 'Active',
      updatedAt: '2026-08-31T21:30:00.000Z'
    }
  }
};
