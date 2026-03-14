import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
