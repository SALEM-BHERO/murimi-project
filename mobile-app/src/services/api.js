import axios from 'axios';
import { getToken } from './storage';

// Change this to your backend URL (e.g. your local IP for Expo Go testing)
const API_BASE_URL = 'http://172.16.14.128:3001/api'; // Android emulator → localhost
// const API_BASE_URL = 'http://localhost:3001/api'; // iOS simulator
// const API_BASE_URL = 'http://192.168.x.x:3001/api'; // Physical device (use your LAN IP)

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request if available
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Auth ---
export const loginUser = (phone_number, password) =>
    api.post('/auth/login', { phone_number, password }).then(r => r.data);

export const registerUser = (phone_number, full_name, password) =>
    api.post('/auth/register', { phone_number, full_name, password }).then(r => r.data);

export const getProfile = () =>
    api.get('/auth/profile').then(r => r.data);

// --- Disease Detection ---
export const detectDisease = async (imageUri, cropType, lat, lng) => {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'crop_scan.jpg'
    });
    if (cropType) formData.append('crop_type', cropType);
    if (lat) formData.append('lat', String(lat));
    if (lng) formData.append('lng', String(lng));

    const token = await getToken();
    const response = await axios.post(`${API_BASE_URL}/disease/detect`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        },
        timeout: 30000
    });
    return response.data;
};

export const getDetectionHistory = () =>
    api.get('/disease/history').then(r => r.data);

export const getDiseaseInfo = (diseaseId) =>
    api.get(`/disease/info/${diseaseId}`).then(r => r.data);

// --- Shops ---
export const getNearbyShops = (lat, lng, radius = 20) =>
    api.get('/shops/nearby', { params: { lat, lng, radius } }).then(r => r.data);

export const getShopById = (id) =>
    api.get(`/shops/${id}`).then(r => r.data);

// --- Knowledge ---
export const getArticles = () =>
    api.get('/knowledge/articles').then(r => r.data);

export const getArticleById = (id) =>
    api.get(`/knowledge/articles/${id}`).then(r => r.data);

export const getCategories = () =>
    api.get('/knowledge/categories').then(r => r.data);

export default api;
