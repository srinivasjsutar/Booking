// src/api/hotelApi.js
import { apiRequest } from './client';

export const hotelApi = {

  // Get featured hotels (carousel)
  getFeatured: () =>
    apiRequest('/hotels/featured', { method: 'GET' }),

  // Get popular hotels
  getPopular: () =>
    apiRequest('/hotels/popular', { method: 'GET' }),

  // Search hotels by query + filters
  search: (query, filters = {}) =>
    apiRequest('/hotels/search', {
      method: 'POST',
      body: { query, ...filters },
    }),

  // Get hotels by category
  getByCategory: (category) =>
    apiRequest(`/hotels/category/${category}`, { method: 'GET' }),

  // Get hotel details by id
  getById: (id) =>
    apiRequest(`/hotels/${id}`, { method: 'GET' }),

  // Get special offers
  getOffers: () =>
    apiRequest('/hotels/offers', { method: 'GET' }),
};