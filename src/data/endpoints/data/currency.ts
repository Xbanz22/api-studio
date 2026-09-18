import { ApiEndpoint } from '../../../types';

export const currencyEndpoint: ApiEndpoint = {
  id: 'data-currency',
  name: 'Currency Converter & Exchange Rates',
  nameId: 'Konversi Mata Uang & Kurs Kurs',
  category: 'data',
  method: 'GET',
  path: '/api/data/currency',
  summary: 'Convert currency amounts across USD, IDR, EUR, JPY, GBP, SGD',
  summaryId: 'Konversi nominal mata uang antara USD, IDR, EUR, JPY, GBP, SGD',
  description: 'Calculates real-time currency conversion rates between major global and regional fiat currencies.',
  descriptionId: 'Menghitung konversi nilai tukar mata uang global dan regional secara akurat.',
  tags: ['Data', 'Finance', 'Currency', 'Exchange'],
  queryParams: [
    { name: 'from', type: 'enum', defaultValue: 'USD', options: ['USD', 'IDR', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD'], description: 'Source currency code', descriptionId: 'Kode mata uang asal' },
    { name: 'to', type: 'enum', defaultValue: 'IDR', options: ['IDR', 'USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD'], description: 'Target currency code', descriptionId: 'Kode mata uang tujuan' },
    { name: 'amount', type: 'number', defaultValue: 100, description: 'Amount to convert', descriptionId: 'Jumlah nominal yang dikonversi' }
  ],
  responseSample: {
    success: true,
    from: 'USD',
    to: 'IDR',
    amount: 100,
    rate: 15873.01587,
    convertedAmount: 1587301.59,
    availableCurrencies: ['USD', 'IDR', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD', 'CNY'],
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
