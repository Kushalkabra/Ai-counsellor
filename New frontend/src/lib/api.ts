import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Force redirect to login on unauthorized
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    signup: (data: { email: string; full_name: string; password: string }) =>
        api.post('/api/auth/signup', data),
    login: (data: { username: string; password: string }) =>
        api.post('/api/auth/login', new URLSearchParams(data), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
    googleLogin: (credential: string) => api.post('/api/auth/google', { credential }),
    getMe: () => api.get('/api/auth/me'),
    deleteAccount: () => api.delete('/api/auth/me'),
};

// Onboarding APIs
export const onboardingAPI = {
    create: (data: any) => api.post('/api/onboarding', data),
    get: () => api.get('/api/onboarding'),
};

// Dashboard APIs
export const dashboardAPI = {
    getStage: () => api.get('/api/dashboard/stage'),
};

// University APIs
export const universityAPI = {
    getAll: (params?: { country?: string; degree?: string; search?: string }) =>
        api.get('/api/universities', { params }),
    shortlist: (university_id: number | string) =>
        api.post('/api/universities/shortlist', { university_id }),
    getShortlisted: () => api.get('/api/universities/shortlisted'),
    lock: (university_id: number | string) =>
        api.post('/api/universities/lock', { university_id }),
    unlock: (university_id: number | string) =>
        api.delete(`/api/universities/lock/${university_id}`),
    getLocked: () => api.get('/api/universities/locked'),
    getDetails: (university_id: number | string) =>
        api.get(`/api/universities/${university_id}/details`),
};

// AI Counsellor APIs
export const aiCounsellorAPI = {
    chat: (message: string) => api.post('/api/ai-counsellor/chat', { message }),
    generateSOP: (universityId: string) => api.post('/api/ai-counsellor/generate-sop', { university_id: parseInt(universityId) }),
    generateStrategy: (universityId: string) => api.post('/api/ai-counsellor/generate-strategy', { university_id: parseInt(universityId) }),
};

// Todo APIs
export const todoAPI = {
    getAll: () => api.get('/api/todos'),
    create: (data: { title: string; description?: string; university_id?: number }) =>
        api.post('/api/todos', data),
    update: (todo_id: number, completed: boolean) =>
        api.patch(`/api/todos/${todo_id}`, { completed }),
};


// Application Document APIs
export const applicationAPI = {
    getDocuments: (universityId: string) => api.get(`/api/applications/${universityId}/documents`),
    updateDocument: (documentId: string, isCompleted: boolean) =>
        api.patch(`/api/applications/documents/${documentId}`, { is_completed: isCompleted }),
};

export default api;
