import axios from 'axios'
import * as SecureStore from 'expo-secure-store'


const api = axios.create({
    baseURL: 'http://localhost:8000/'
})

api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const origRequest = error.config

        if(error.response.status === 401){
            try {
                const newAccessToken = await refreshAccessToken();
                origRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(origRequest);
            } catch (refreshError) {
                console.error('Unable to refresh access token:', refreshError);
                return Promise.reject(refreshError);
            }
        }


    }
)