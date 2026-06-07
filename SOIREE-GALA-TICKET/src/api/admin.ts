import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const adminLogin = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/admin/login`, { username, password });
  return response.data;
};

export const adminSignup = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/admin/signup`, { username, password });
  return response.data;
};

export const getOrders = async (token: string) => {
  const response = await axios.get(`${API_URL}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateOrderStatus = async (token: string, orderId: string, status: string) => {
  const response = await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, 
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
