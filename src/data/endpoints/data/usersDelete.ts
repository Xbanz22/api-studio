import { ApiEndpoint } from '../../../types';

export const dataUsersDeleteEndpoint: ApiEndpoint = {
  id: 'data-users-delete',
  name: 'Delete User by ID',
  nameId: 'Hapus Pengguna Berdasarkan ID',
  category: 'data',
  method: 'DELETE',
  path: '/api/data/users/usr_3',
  summary: 'Delete user record by specific ID',
  summaryId: 'Hapus data pengguna berdasarkan ID',
  description: 'Removes the specified user from the database collection.',
  descriptionId: 'Menghapus data pengguna yang ditentukan dari database.',
  tags: ['Data', 'Users', 'CRUD', 'DELETE'],
  responseSample: {
    success: true,
    message: "User 'Budi Santoso' berhasil dihapus.",
    deletedId: 'usr_3'
  }
};
