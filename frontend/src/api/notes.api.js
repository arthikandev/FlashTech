import api from "./axiosInstance.js";

export const getNotes = () => api.get("/api/notes").then((r) => r.data.data);
export const getNote = (id) => api.get(`/api/notes/${id}`).then((r) => r.data.data);
export const createNote = (data) => api.post("/api/notes", data).then((r) => r.data.data);
export const updateNote = (id, data) => api.put(`/api/notes/${id}`, data).then((r) => r.data.data);
export const deleteNote = (id) => api.delete(`/api/notes/${id}`).then((r) => r.data.data);
