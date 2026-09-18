import { ApiEndpoint } from '../../../types';

export const productsEndpoint: ApiEndpoint = {
  id: 'data-products',
  name: 'Product Catalog & Prices',
  nameId: 'Katalog Produk & Harga',
  category: 'data',
  method: 'GET',
  path: '/api/data/products',
  summary: 'Query e-commerce products with category and price filters',
  summaryId: 'Query data produk e-commerce dengan filter kategori dan harga',
  description: 'Provides structured product inventory data with stock status, category filters, and ratings.',
  descriptionId: 'Menyediakan data inventaris produk terstruktur dengan filter kategori dan status stok.',
  tags: ['Data', 'E-Commerce', 'Products'],
  queryParams: [
    { name: 'category', type: 'enum', defaultValue: '', options: ['', 'Electronics', 'Furniture', 'Audio', 'Accessories'], description: 'Filter by category', descriptionId: 'Filter berdasarkan kategori produk' },
    { name: 'minPrice', type: 'number', defaultValue: '', description: 'Minimum price filter', descriptionId: 'Filter harga minimum' },
    { name: 'inStock', type: 'enum', defaultValue: '', options: ['', 'true', 'false'], description: 'Only in-stock items', descriptionId: 'Hanya tampilkan produk tersedia' }
  ],
  responseSample: {
    success: true,
    count: 5,
    data: [
      { id: 'prod_101', name: 'Wireless Mechanical Keyboard RGB', category: 'Electronics', price: 129.99, rating: 4.8, inStock: true, stock: 45 },
      { id: 'prod_102', name: 'Ultra HD 4K Webcam with AI Mic', category: 'Electronics', price: 89.5, rating: 4.6, inStock: true, stock: 120 }
    ],
    timestamp: '2026-08-31T21:30:00.000Z'
  }
};
