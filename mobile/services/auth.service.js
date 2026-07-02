import { api } from "../lib/api.js";

export const loginApi = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    // console.log(response.data)
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerApi = async (data) => {
  const res = await api.post("/auth/register", data);
  // console.log(res);
  return res.data;
};
