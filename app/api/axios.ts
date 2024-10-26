import axios from 'axios'
import * as SecureStore from 'expo-secure-store'


const api = axios.create({
    // paste your backend url here
    // baseURL: 'http://192.168.1.191:8000/
    baseURL: 'http://192.168.1.13:8000/'
    // baseURL: 'http://172.20.10.7:8000/'
    // baseURL: 'http://192.168.1.25:8000/'
})

api.interceptors.request.use(
    (response) => response, 
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('my-jwt');
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`,
                };
            }
        } catch (error) {
            console.error('Error retrieving access token:', error);
        }
        return config;
    },
    // async (error: any) => {
    //     const origRequest = error.config

    //     if(error.response && error.response.status === 401){
    //         try {
    //             const newAccessToken = await refreshAccessToken();
    //             origRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    //             return api(origRequest);
    //         } catch (refreshError) {
    //             console.error('Unable to refresh access token:', refreshError);
    //             return Promise.reject(refreshError);
    //         }
    //     }


    // }
)

export default api;