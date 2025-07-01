import axios, { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getProductById = (id: string): Promise<AxiosResponse> =>
  api.get(`/products/${id}`);

export const updateProduct = (
  id: string,
  data: { name: string; category: string }
): Promise<AxiosResponse> => api.put(`/products/${id}`, data);

export const deleteProduct = (id: string): Promise<AxiosResponse> =>
  api.delete(`/products/${id}`);

export const getProductIns = (
  productId: string,
  page = 0
): Promise<AxiosResponse> =>
  api.get("/product-ins", { params: { productId, page } });

export const addProductIn = (data: {
  productId: string;
  quantity: number;
  dateIn?: string;
}): Promise<AxiosResponse> => api.post("/product-ins", data);

export const getProductOuts = (
  productId: string,
  page = 0
): Promise<AxiosResponse> =>
  api.get("/product-outs", { params: { productId, page } });

export const addProductOut = (data: {
  productId: string;
  quantity: number;
  dateOut?: string;
}): Promise<AxiosResponse> => api.post("/product-outs", data);

export default api;