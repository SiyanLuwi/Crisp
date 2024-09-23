import { API_URL, AuthContext } from '../../AuthContext/AuthContext'
import * as SecureStore from 'expo-secure-store';



const handleErrors = (response) => {
    if(!response.ok){
        throw new Error('Network Error!')
    }
    return response.data;
}

export const citizenReports = async () => {
    // const TOKEN_KEY = await SecureStore.getItemAsync(TOKEN_KEY)

}