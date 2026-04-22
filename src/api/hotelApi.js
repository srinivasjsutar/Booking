// src/api/hotelApi.js
import { BASE_URL, apiRequest } from './client';

export const hotelApi = {
  getFeatured:     ()       => apiRequest('/hotels/featured'),
  getPopular:      ()       => apiRequest('/hotels/popular'),
  getByCategory:   (cat)    => apiRequest(`/hotels/category/${cat}`),
  search:          (q)      => apiRequest(`/hotels/search?q=${encodeURIComponent(q)}`),
  getById:         (id)     => apiRequest(`/hotels/${id}`),
};

export const bookingApi = {
  // Create a booking — requires auth token
  create: (payload, token) =>
    apiRequest('/bookings', { method: 'POST', body: payload, token }),

  // Get all bookings for the logged-in user
  getMyBookings: (token) =>
    apiRequest('/bookings/my', { token }),

  // Get a single booking
  getById: (id, token) =>
    apiRequest(`/bookings/${id}`, { token }),

  // Cancel a booking
  cancel: (id, token) =>
    apiRequest(`/bookings/${id}/cancel`, { method: 'PATCH', token }),
};