import axios from "axios";
import React, { useState, createContext, useEffect, useContext } from "react";
import * as SecureStore from 'expo-secure-store'
import { router } from "expo-router";
interface AuthProps{
    authState?: {token: string | null, authenticated: boolean | null},
    onRegister?: (username: string, email: string, password: string, password_confirm: string, address: string, contact_no: string ) => Promise<any>,
    onLogin?: (username: string, password: string) => Promise<any>,
    onLogout?: () => Promise <any>;
}
import * as Network from 'expo-network';
const TOKEN_KEY = 'my-jwt'
const REFRESH_KEY = 'my-jwt-refresh'
const EXPIRATION= 'accessTokenExpiration'
const ROLE = 'my-role'
export const API_URL = 'http://192.168.1.191:8000' //change this based on your url
const AuthContext = createContext<AuthProps>({});
export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null, 
        authenticated: boolean | null
    }>({
        token: null,
        authenticated: null
    })

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY)
            console.log("stored: ", token)
            if(token){
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthState({
                    token: token,
                    authenticated: true
                })
            }
        }
    }, [])


    const register = async (
        username: string,
        email: string,
        password: string,
        password_confirm: string,
        address: string,
        contact_no: string) => {
        const ipv = await Network.getIpAddressAsync();
        console.log(ipv)
            try {
                const res = await axios.post(`${API_URL}/api/citizen/registration/`, {
                    username,
                    email,
                    password,
                    password_confirm,
                    address,
                    contact_number: contact_no,
                    ipv
                })

                return res

            } catch (error) {
                console.error(error);
                return {error: true, msg:"Register error!"}
            }
        }

       const login = async (username: string, password: string) => {
    try {
        console.log("Starting login process for username:", username); // Log the username
        // Implement login functionality here
        const { data } = await axios.post(`${API_URL}/api/token/`, { username, password });
        console.log("Login response received:", data); // Log the response from the server

        // Check if data contains the expected properties
        if (!data.access || !data.refresh) {
            throw new Error('Authentication failed. No access or refresh token received.');
        }

        setAuthState({
            token: data.access,
            authenticated: true
        });

        const expirationTime = Date.now() + (60 * 60 * 1000);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

        const storageItems = {
            [TOKEN_KEY]: data.access,
            [REFRESH_KEY]: data.refresh,
            [ROLE]: data.account_type,
            [EXPIRATION]: expirationTime.toString(),
            'username': data.username,
            'email': data.email,
            'address': data.address,
            'contact_number': data.contact_number,
            'is_email_verified': data.is_email_verified
        };

        // Log what is going to be stored
        console.log("Storing the following items:", storageItems);

        await Promise.all(
            Object.entries(storageItems).map(([key, value]) => SecureStore.setItemAsync(key, value.toString()))
        );

        return data;

    } catch (error: any) {
        // Log the error for debugging
        console.error("Login error occurred:", error);
        
        // Check for error response from the server
        if (error.response) {
            console.log("Error response data:", error.response.data); // Log error data from server
            if (error.response.status === 401) {
                throw new Error('Invalid username or password');
            } else {
                throw new Error('An unexpected error occurred');
            }
        } else {
            // Network or other errors
            throw new Error('Network error or server not reachable');
        }
    }
};

    
        const logout = async () => {
            axios.defaults.headers.common['Authorization'] = ''
            await SecureStore.deleteItemAsync(TOKEN_KEY)
            await SecureStore.deleteItemAsync(REFRESH_KEY)
            await SecureStore.deleteItemAsync(EXPIRATION)
            await SecureStore.deleteItemAsync(ROLE)
            setAuthState({
                token: null,
                authenticated: null
            })
            console.log("Logging out...")
            router.push('/pages/login')

        };
    
        const value = {
            onRegister: register,
            onLogin: login,
            onLogout: logout,
            authState
        };
    
        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}