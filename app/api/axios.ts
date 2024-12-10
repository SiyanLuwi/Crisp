
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'


const api = axios.create({
    // baseURL: 'https://django-firebase-psql.onrender.com/'
    baseURL: 'http://192.168.1.13:8000/'
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