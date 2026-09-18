import { ApiEndpoint } from '../../../types';

export const systemStatusEndpoint: ApiEndpoint = {
  id: 'system-status',
  name: 'Server Health & Metrics',
  nameId: 'Status Server & Metrik',
  category: 'system',
  method: 'GET',
  path: '/api/status',
  summary: 'Check server uptime, memory usage and health status',
  summaryId: 'Cek uptime server, penggunaan memori dan status kesehatan',
  description: 'Returns real-time server runtime telemetry, uptime, memory, version, and count of active keys and mock endpoints.',
  descriptionId: 'Mengembalikan telemetri runtime server real-time, uptime, memori, versi, dan jumlah key/mock aktif.',
  tags: ['System', 'Health', 'Monitoring'],
  responseSample: {
    status: 'healthy',
    service: 'REST API Hub & Studio Engine',
    version: '2.4.0',
    uptimeSeconds: 1420,
    uptimeFormatted: '0h 23m 40s',
    timestamp: '2026-08-31T21:30:00.000Z',
    activeMockRoutes: 2,
    registeredApiKeys: 3,
    memory: { rssMB: 54.2, heapUsedMB: 28.6 }
  }
};
