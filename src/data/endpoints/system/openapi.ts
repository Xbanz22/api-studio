import { ApiEndpoint } from '../../../types';

export const systemOpenapiEndpoint: ApiEndpoint = {
  id: 'system-openapi',
  name: 'OpenAPI Specification JSON',
  nameId: 'Spesifikasi OpenAPI JSON',
  category: 'system',
  method: 'GET',
  path: '/api/docs/openapi.json',
  summary: 'Download or inspect OpenAPI 3.0.0 documentation spec',
  summaryId: 'Unduh atau inspeksi spesifikasi dokumentasi OpenAPI 3.0.0',
  description: 'Full OpenAPI v3 specification file compatible with Swagger, Postman, and API client code generators.',
  descriptionId: 'File spesifikasi OpenAPI v3 lengkap kompatibel dengan Swagger, Postman, dan generator SDK client.',
  tags: ['System', 'OpenAPI', 'Swagger'],
  responseSample: {
    openapi: '3.0.0',
    info: { title: 'REST API Hub & Studio Platform', version: '2.4.0' },
    paths: { '/api/status': { get: { summary: 'Check server health' } } }
  }
};
