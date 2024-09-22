import axios from "axios";
import { useState, createContext, useEffect, useContext, Children } from "react";
import * as SecureStore from 'expo-secure-store'

interface AuthProps{
    token?: string | null,
    authenticated?: boolean | null,
    authState?: (token: string | null, authenticated: boolean | null) => Promise<any>,
    onRegister?: (username: string, email: string, password: string, confirm_password: string, age: number, address: string, contact_no: string ) => Promise<any>,
    onLogin?: (username: string, password: string) => Promise <any>,
    onLogout?: () => Promise <any>;
}

const TOKEN_KEY = 'my-jwt'
export const API_URL = 'https://191.168.1.191:8000'
const AuthContext = createContext<AuthProps>({});
const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<AuthProps>({
        token: null,
        authenticated: null
    })


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
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                await SecureStore.setItemAsync(TOKEN_KEY, res.data.access)

                return res

            } catch (error) {
               return {error: true, msg: "Login Error!"} 
            }
        };
    
        const logout = async () => {
            axios.defaults.headers.common['Authorization'] = ''
            await SecureStore.deleteItemAsync(TOKEN_KEY)

            setAuthState({
                token: null,
                authenticated: null
            })
        };
    
        const value = {
            onRegister: register,
            onLogin: login,
            onLogout: logout,
            useAuth
        };
    
        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}