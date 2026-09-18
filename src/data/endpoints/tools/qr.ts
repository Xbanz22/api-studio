import { ApiEndpoint } from '../../../types';

export const qrEndpoint: ApiEndpoint = {
  id: 'tools-qr',
  name: 'QR Code Generator',
  nameId: 'Generator QR Code',
  category: 'tools',
  method: 'GET',
  path: '/api/tools/qr',
  summary: 'Generate downloadable QR Code image or SVG',
  summaryId: 'Hasilkan gambar QR Code yang dapat diunduh atau format SVG',
  description: 'Generates high-resolution 2D QR barcode images in Base64 Data URL or direct SVG format with custom size and colors.',
  descriptionId: 'Menghasilkan barcode 2D QR Code resolusi tinggi dalam format Base64 DataURL atau direct SVG dengan kustomisasi ukuran dan warna.',
  tags: ['Tools', 'QR Code', 'Image', 'Utility'],
  queryParams: [
    { name: 'text', type: 'string', required: true, defaultValue: 'https://rest-api-hub.app', description: 'Content text or URL encoded in the QR code', descriptionId: 'Teks atau URL yang dimasukkan ke dalam QR code' },
    { name: 'format', type: 'enum', defaultValue: 'dataurl', options: ['dataurl', 'svg'], description: 'Output format: JSON DataURL or pure SVG image', descriptionId: 'Format output: JSON DataURL atau gambar SVG murni' },
    { name: 'size', type: 'number', defaultValue: 300, description: 'Width/Height in pixels (100 - 1000)', descriptionId: 'Ukuran lebar/tinggi dalam pixel (100 - 1000)' }
  ],
  responseSample: {
    success: true,
    text: 'https://rest-api-hub.app',
    format: 'dataurl',
    dimensions: '300x300',
    qrDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5Rf5...',
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
