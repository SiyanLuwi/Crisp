import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingButton from "@/components/loadingButton";
const bgImage = require('@/assets/images/landing_page.png');
import { useAuth } from '@/AuthContext/AuthContext';
import * as SecureStore from 'expo-secure-store'
// Get screen dimensions
const { width, height } = Dimensions.get("window");

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { onLogin } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await onLogin!(username, password)  
      if(res.status === 401){
          throw new Error('Network Error: Unable to Login! :))')
      }
      const role = await SecureStore.getItemAsync('my-role')
      setLoading(false)
      if(role === 'Citizen'){
        router.push('/(tabs)/home')
      }else if(role === 'Citizen'){
        router.push('/(tabs)_employee/home')
      }else{
        alert('You are accessing protected routes.')
        return
      }
    } catch (error) {
        console.log(error)
    }

  };

  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.bgImage} />
      <View style={styles.loginContainer}>
        <Text style={styles.text}>Welcome Back!</Text>
        <TextInput
          style={styles.username}
          placeholder="Enter your username"
          placeholderTextColor="#888"
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.password}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!passwordVisible}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.togglePassword}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <LoadingButton 
          title="LOGIN" 
          onPress={handleLogin} 
          loading={loading} 
        />
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotPass}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.register} onPress={() => router.navigate(`/pages/register`)}>
          <Text style={styles.already}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loginContainer: {
    position: "absolute",
    bottom: 0,
    paddingVertical: height * 0.05,
    backgroundColor: "#F0F4C3",
    width: "100%",
    height: height * 0.62,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  text: {
    color: "#0C3B2D",
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: RFPercentage(5),
    marginBottom: height * 0.03,
  },
  username: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "80%",
    borderRadius: 10,
    marginBottom: 20,
  },
  password: {
    flex: 1,
    fontSize: RFPercentage(2.5),
    padding: 10,
  },
  togglePassword: {
    padding: 10,
  },
  forgot: {
    marginBottom: 20,
    justifyContent: "center",
    alignContent: "center",
  },
  forgotPass: {
    fontSize: RFPercentage(2.5),
    color: "#0C3B2D",
  },
  register: {
    marginTop: height * 0.03,
  },
  already: {
    fontSize: RFPercentage(2.5),
    color: "#0C3B2D",
    textAlign: "center",
  },
});
