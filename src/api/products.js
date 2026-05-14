import api from './axios';

export const getProducts = (page = 1) => api.get(`/products?page=${page}`);
