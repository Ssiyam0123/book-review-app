import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const createBook = async (bookData) => {
  const res = await api.post("/books", bookData);
  return res.data;
};

export const fetchBooks = async ({ pageParam = 1 }) => {
  const res = await api.get(`/books?page=${pageParam}&limit=5`);
  return res.data;
};

export const fetchUserBooks = async () => {
  const res = await api.get("/books/user");
  return res.data;
};

export const deleteBook = async (bookId) => {
  const res = await api.delete(`/books/${bookId}`);
  return res.data;
};

export const editBook = async (bookId, bookData) => {
  const res = await api.put(`/books/${bookId}`, bookData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const likeBook = async (bookId) => {
  const res = await api.put(`/likes/${bookId}`);
  return res.data;
};

export const fetchBook = async (bookId) => {
  const res = await api.get(`/books/${bookId}`);
  return res.data;
};

export const fetchComments = async (bookId) => {
  const res = await api.get(`/comments/${bookId}`);
  return res.data;
};

export const postComment = async (bookId, text) => {
  const res = await api.post(`/comments/${bookId}`, { text });
  return res.data;
};
