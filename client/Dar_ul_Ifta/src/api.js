import axios from "axios";
const API =
  import.meta.env.VITE_API_URL || "https://dar-ul-ifta-xzyf.vercel.app/api/questions";

export const fetchQuestions = () => axios.get(`${API}/`);
export const createQuestion = (data) => axios.post(`${API}/`, data);
export const updateQuestion = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteQuestion = (id) => axios.delete(`${API}/${id}`);
export const fetchStats = () => axios.get(`${API}/stats/all`);
export const filter = (data) => axios.post(`${API}/filter`, data);

export default API;
