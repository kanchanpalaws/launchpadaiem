import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const authAPI = {
  exchangeSession: (session_id) => api.post("/auth/session", { session_id }),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const projectsAPI = {
  list: () => api.get("/projects"),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const walletAPI = {
  get: () => api.get("/wallet"),
  credit: (amount, description) => api.post("/wallet/credit", { amount, description }),
  debit: (amount, description) => api.post("/wallet/debit", { amount, description }),
  upgrade: (plan) => api.post("/wallet/upgrade", { plan }),
};

export const aiAPI = {
  generateContent: (business_info) => api.post("/ai/generate-content", { business_info }),
  generateQuestions: (business_type, current_info) =>
    api.post("/ai/generate-questions", { business_type, current_info }),
  chat: (message, context) => api.post("/ai/chat", { message, context }),
  generateTagline: (business_name, description) =>
    api.post("/ai/generate-tagline", { business_name, description }),
};

export const mediaAPI = {
  generateLogo: (business_name, style) =>
    api.post("/media/generate-logo", { business_name, style }),
  generateImage: (prompt) => api.post("/media/generate-image", { prompt }),
};

export const githubAPI = {
  publish: (project_id, repo_name) =>
    api.post("/github/publish", { project_id, repo_name }),
  getStatus: (project_id) => api.get(`/github/status/${project_id}`),
};

export default api;
