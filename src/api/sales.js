import api from './axios';

export const getSales   = (page = 1) => api.get(`/sales?page=${page}`);
export const getSale    = (id)        => api.get(`/sales/${id}`);
export const createSale = (data)      => api.post('/sales', data);
