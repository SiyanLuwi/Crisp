import * as SecureStore from 'expo-secure-store';


const TOKEN_KEY = 'my-jwt'
const REFRESH_KEY = 'my-jwt-refresh'
const EXPIRATION= 'accessTokenExpiration'

const refreshToken = async () => {
    const REFRESH = await SecureStore.getItemAsync(REFRESH)

    if(!REFRESH){
        throw new Error('No refresh token available. User needs to log in again. :)')
    }

    const res = await fetch('http://localhost:8000/user/token/refresh/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ REFRESH })
    })

    if (response.ok) {
        const data = await response.json();
        await storeTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } else {
        throw new Error('Unable to refresh token. User may need to log in again.');
    }

}

const storeTokens = async (accessToken, refreshToken) => {
    const expirationTime = Date.now() + (60 * 60 * 1000); // 60 minutes in milliseconds
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH, refreshToken);
    await SecureStore.setItemAsync(EXPIRATION, expirationTime.toString());
};