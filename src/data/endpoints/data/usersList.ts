import { ApiEndpoint } from '../../../types';

export const dataUsersListEndpoint: ApiEndpoint = {
  id: 'data-users-list',
  name: 'List Users (Search & Pagination)',
  nameId: 'Daftar Pengguna (Cari & Paginasi)',
  category: 'data',
  method: 'GET',
  path: '/api/data/users',
  summary: 'Retrieve user accounts with query filters',
  summaryId: 'Ambil daftar pengguna dengan filter pencarian dan role',
  description: 'Fetches mock user list with query search parameter, role filtering (Admin, Developer, Editor), and pagination limit/offset.',
  descriptionId: 'Mengambil daftar pengguna dengan filter pencarian nama/email, role, status aktif, dan paginasi.',
  tags: ['Data', 'Users', 'CRUD', 'REST'],
  queryParams: [
    { name: 'search', type: 'string', defaultValue: '', description: 'Search term for name or email', descriptionId: 'Kata kunci pencarian nama atau email' },
    { name: 'role', type: 'enum', defaultValue: '', options: ['', 'Admin', 'Developer', 'Editor', 'Viewer'], description: 'Filter by user role', descriptionId: 'Filter berdasarkan role pengguna' },
    { name: 'status', type: 'enum', defaultValue: '', options: ['', 'Active', 'Inactive'], description: 'Filter by account status', descriptionId: 'Filter berdasarkan status akun' },
    { name: 'limit', type: 'number', defaultValue: 10, description: 'Items per page', descriptionId: 'Jumlah item per halaman' }
  ],
  responseSample: {
    success: true,
    total: 5,
    limit: 10,
    offset: 0,
    data: [
      { id: 'usr_1', name: 'Ahmad Fauzi', email: 'ahmad.fauzi@example.com', role: 'Admin', status: 'Active' },
      { id: 'usr_2', name: 'Siti Nurhaliza', email: 'siti.nur@example.com', role: 'Developer', status: 'Active' }
    ],
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
