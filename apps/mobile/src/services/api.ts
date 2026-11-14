import axios from 'axios';

export const api = axios.create({

  baseURL:
    'http://10.27.3.125:3000',

  timeout: 10000,

});