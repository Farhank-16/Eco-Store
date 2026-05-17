import axios from 'axios';

const BASE = "http://localhost:3000";

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
