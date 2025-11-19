import axios from 'axios';


const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });


export const fetchResolvers = () => API.get('/resolvers');
export const createResolver = (data) => API.post('/resolvers', data);


export const fetchQuestions = (params) => API.get('/questions', { params });
export const fetchQuestion = (id) => API.get(`/questions/${id}`);
export const createQuestion = (data) => API.post('/questions', data);
export const updateQuestion = (id, data) => API.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);
export const fetchStats = () => API.get('/questions/stats/summary');


export default API;