import axios from 'axios';

// const BASE = "http://localhost:3000";
const BASE = import.meta.env.VITE_BASE_URL;

export const getCategories = async () => {
  const res = await axios.get(`${BASE}/category/get`);
  return res.data;
};

export const addCategory = async (data) => {
  const res = await axios.post(`${BASE}/category/add`, data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axios.put(`${BASE}/category/update/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${BASE}/category/delete/${id}`);
  return res.data;
};

export const getProducts = async () => {
  const res = await axios.get(`${BASE}/product/get`);
  return res.data;
};

export const addProduct = async (data) => {
  const res = await axios.post(`${BASE}/product/add`, data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await axios.put(`${BASE}/product/update/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${BASE}/product/delete/${id}`);
  return res.data;
};

export const createRazorpayOrder = async (amount) => {
  const res = await axios.post(`${BASE}/payment/orders`, { amount }, { withCredentials: true });
  return res.data;
};

export const verifyRazorpayPayment = async (data) => {
  const res = await axios.post(`${BASE}/payment/verify`, data, { withCredentials: true });
  return res.data;
};

export const getRazorpayKey = async () => {
  const res = await axios.get(`${BASE}/payment/key`);
  return res.data;
};

export const getAllOrders = async () => {
  const res = await axios.get(`${BASE}/payment/all-orders`, { withCredentials: true });
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await axios.put(`${BASE}/payment/order-status/${orderId}`, { status }, { withCredentials: true });
  return res.data;
};

export const getUserOrders = async () => {
  const res = await axios.get(`${BASE}/payment/my-orders`, { withCredentials: true });
  return res.data;
};
