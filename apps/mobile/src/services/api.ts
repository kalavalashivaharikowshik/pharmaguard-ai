import axios from 'axios';

import { API_URL } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  // Free hosting tiers can take ~30s to wake up on the first request.
  timeout: 30000,
});
