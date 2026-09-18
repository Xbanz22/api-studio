import { ApiEndpoint } from '../../../types';

export const weatherEndpoint: ApiEndpoint = {
  id: 'data-weather',
  name: 'Live Weather Forecast API',
  nameId: 'API Ramalan Cuaca Live',
  category: 'data',
  method: 'GET',
  path: '/api/data/weather',
  summary: 'Simulated weather forecasts and metrics for any city',
  summaryId: 'Ramalan cuaca dan metrik suhu untuk berbagai kota',
  description: 'Provides weather conditions, temperature in Celsius and Fahrenheit, humidity, wind speed, UV index, and 3-day forecast.',
  descriptionId: 'Menyediakan kondisi cuaca, suhu Celsius/Fahrenheit, kelembaban, kecepatan angin, dan ramalan 3 hari.',
  tags: ['Data', 'Weather', 'City', 'Forecast'],
  queryParams: [
    { name: 'city', type: 'string', defaultValue: 'Jakarta', description: 'City name (e.g. Jakarta, Bandung, Tokyo, London, NYC)', descriptionId: 'Nama kota (contoh: Jakarta, Bandung, Surabaya, Tokyo, London)' }
  ],
  responseSample: {
    success: true,
    city: 'Jakarta',
    country: 'Indonesia',
    temperature: { celsius: 31, fahrenheit: 87.8 },
    condition: 'Partly Cloudy',
    humidity: '72%',
    windSpeedKmh: 14,
    uvIndex: 7,
    forecast: [
      { day: 'Tomorrow', tempC: 32, condition: 'Partly Cloudy' },
      { day: 'Day 2', tempC: 30, condition: 'Sunny' },
      { day: 'Day 3', tempC: 31, condition: 'Light Rain' }
    ],
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
