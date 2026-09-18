import { ApiEndpoint } from '../../../types';

export const passwordEndpoint: ApiEndpoint = {
  id: 'tools-password',
  name: 'Strong Password Generator',
  nameId: 'Generator Password Kuat',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/password',
  summary: 'Generate secure random passwords with customizable entropy',
  summaryId: 'Hasilkan password acak aman dengan pengaturan entropi',
  description: 'Generates secure passwords with customizable length, symbols, numbers, and uppercase character options.',
  descriptionId: 'Hasilkan kata sandi kuat dengan pengaturan panjang, simbol, angka, dan huruf besar.',
  tags: ['Tools', 'Password', 'Security'],
  queryParams: [
    { name: 'length', type: 'number', defaultValue: 18, description: 'Password length (6 - 64)', descriptionId: 'Panjang password (6 - 64)' },
    { name: 'symbols', type: 'boolean', defaultValue: true, description: 'Include special symbols (!@#$%^&*)', descriptionId: 'Sertakan simbol khusus (!@#$%^&*)' },
    { name: 'numbers', type: 'boolean', defaultValue: true, description: 'Include numbers (0-9)', descriptionId: 'Sertakan angka (0-9)' },
    { name: 'uppercase', type: 'boolean', defaultValue: true, description: 'Include uppercase letters (A-Z)', descriptionId: 'Sertakan huruf besar (A-Z)' }
  ],
  responseSample: {
    success: true,
    password: 'kR#9$wP2!vN8@mQ7&z',
    length: 18,
    entropyScore: 100,
    strength: 'Very Strong',
    options: { length: 18, includeSymbols: true, includeNumbers: true, includeUppercase: true },
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
