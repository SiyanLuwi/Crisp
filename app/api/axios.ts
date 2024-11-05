import axios from 'axios'
import * as SecureStore from 'expo-secure-store'


const api = axios.create({
    // paste your backend url here
    baseURL: 'http://192.168.1.191:8000/'
    // baseURL: 'http://192.168.105.172:8000/'
    // baseURL: 'http://172.20.10.7:8000/'
    //baseURL: 'http://192.168.1.25:8000/'
    //baseURL: 'http://192.168.254.179:8000/'
    // baseURL: 'http://192.168.254.179:8000/'
    // baseURL: 'http://192.168.1.25:8000/'
})

api.interceptors.request.use(
    async (config) => {
      try {
        const token = await SecureStore.getItemAsync('my-jwt');
        if (token && config.headers) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.error('Error retrieving access token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error); 
    }
  );



export default api;