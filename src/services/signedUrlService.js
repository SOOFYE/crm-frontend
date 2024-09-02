// src/services/signedUrlService.js
import axios from 'axios';
import { getCookie } from '../utils/getcookie';

const API_URL = process.env.REACT_APP_BACKEND_URL + 's3/generate-signed-url';

export const getSignedUrl = async (s3Url) => {
    const token = getCookie('token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(API_URL, { s3Url }, { headers });
    console.log(response.data.signedUrl)
    return response.data.signedUrl; 
};