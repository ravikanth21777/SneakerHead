// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust if your backend is on a different host/port
  headers: {
    'Content-Type': 'application/json'
  }
});

// If you ever need to send the JWT with future requests, you'll do something like:
// api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export default api;
