import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const uploadFile = async (file: File, targetDeviceId?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetDeviceId) {
        formData.append('target_device_id', targetDeviceId);
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('API Error details:', error);
        throw error;
    }
};

export const fetchFiles = async (): Promise<string[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/files`);
        return response.data.files;
    } catch (error) {
        console.error('API Error fetching files:', error);
        throw error;
    }
};

export const getDownloadUrl = (filename: string): string => {
    return `${API_BASE_URL}/download/${encodeURIComponent(filename)}`;
};
