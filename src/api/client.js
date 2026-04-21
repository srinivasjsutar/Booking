// src/api/client.js
export const BASE_URL = 'http://192.168.0.113:5000/api';

export const apiRequest = async (endpoint, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  console.log('📡 REQUEST:', method, `${BASE_URL}${endpoint}`);
  console.log('📦 BODY:', JSON.stringify(body));

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    console.log('📥 RESPONSE STATUS:', response.status);
    console.log('📥 RESPONSE DATA:', JSON.stringify(data));

    if (!response.ok) {
      const message = data.errors?.[0]?.msg || data.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.log('❌ FETCH ERROR:', err.message);
    throw err;
  }
};