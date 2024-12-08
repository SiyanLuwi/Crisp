
import axios from 'axios'
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store'

const manifest = Constants.manifest as { extra?: { BACKEND_URL?: string } };
const BACKEND_URL = manifest.extra?.BACKEND_URL;
const api = axios.create({
    // paste your backend url here
    // baseURL: 'http://192.168.1.191:8000/'
    // baseURL: 'http://192.168.105.172:8000/'
    // baseURL: 'http://172.20.10.7:8000/' 
    // baseURL: 'http://192.168.1.17:8000/'S  
    //baseURL: 'http://192.168.254.179:8000/'
    // baseURL: 'http://192.168.254.179:8000/'
    // baseURL: 'http://192.168.100.15:8000/'
    baseURL: BACKEND_URL
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