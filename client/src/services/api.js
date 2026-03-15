import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ADMIN_TOKEN_STORAGE_KEY = 'campus_admin_token';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
});

export const setAdminToken = (token) => {
    if (token) {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } else {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);

export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);

export const sendChatMessage = async (question, language = 'English') => {
    try {
        let studentId = localStorage.getItem('campus_student_id');
        if (!studentId) {
            studentId = 'STU' + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem('campus_student_id', studentId);
        }

        const response = await api.post('/chat', {
            question,
            language,
            studentId,
            category: 'general'
        });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
};

export const createAppointment = async (appointmentData) => {
    try {
        const response = await api.post('/admin/appointments', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

export const getAppointments = async () => {
    try {
        const response = await api.get('/admin/appointments');
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
};

export const getStudentProfile = async () => {
    try {
        let studentId = localStorage.getItem('campus_student_id');
        if (!studentId) {
            studentId = 'STU' + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem('campus_student_id', studentId);
        }
        const response = await api.get(`/user/profile/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student profile:', error);
        throw error;
    }
};

export default api;
