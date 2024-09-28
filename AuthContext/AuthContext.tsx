import axios from "axios";
import { useState, createContext, useEffect, useContext } from "react";
import * as SecureStore from 'expo-secure-store'
import { router } from "expo-router";
interface AuthProps{
    authState?: {token: string | null, authenticated: boolean | null},
    onRegister?: (username: string, email: string, password: string, confirm_password: string, age: number, address: string, contact_no: string ) => Promise<any>,
    onLogin?: (username: string, password: string) => Promise<any>,
    onLogout?: () => Promise <any>;
}

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


    const register = async (username: string,
        email: string,
        password: string,
        confirm_password: string,
        age: number,
        address: string,
        contact_no: string) => {
            
            try {
                const res = await axios.post(`${API_URL}/user/register/`, {
                    username,
                    email,
                    password,
                    confirm_password,
                    age,
                    contact_no,
                })

                return res

            } catch (error) {
                return {error: true, msg:"Register error!"}
            }
        }

        const login = async (username: string, password: string) => {
            try {
                // Implement login functionality here
                const res = await axios.post(`${API_URL}/user/token/`, {username, password})
                
                setAuthState({
                    token: res.data.access,
                    authenticated: true
                })
                const expirationTime = Date.now() + (60 * 60 * 1000);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                await SecureStore.setItemAsync(TOKEN_KEY, res.data.access)
                await SecureStore.setItemAsync(REFRESH_KEY, res.data.refresh)
                await SecureStore.setItemAsync(ROLE, res.data.account_type)
                await SecureStore.setItemAsync(EXPIRATION, expirationTime.toString());
                return res

            } catch (error) {
               return {error: true, msg: "Login Error!"} 
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