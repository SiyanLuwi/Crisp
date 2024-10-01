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
import ForgotPasswordModal from "@/components/forgotPassModal";
import { useAuth } from "@/AuthContext/AuthContext";
const bgImage = require('@/assets/images/landing_page.png');
// Get screen dimensions
const { height } = Dimensions.get("window");
import * as SecureStore from 'expo-secure-store'
export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [modalVisible, setModalVisible] = useState(false);
  const IS_EMAIL_VERIFIED = 'is_email_verified'
  const { onLogin } = useAuth()


  const handleLogin = async () => {
    setLoading(true);
    try {   
       const result = await onLogin!(username, password);    
        const is_email_verified = await SecureStore.getItemAsync(IS_EMAIL_VERIFIED)
        if(is_email_verified !== 'true'){
            router.push('/pages/verifyPage')
            return;
        }
        router.push('/(tabs)/home');
    } catch (error: any) {
          if (error.message === 'Invalid username or password') {
            alert('Login failed: Invalid username or password');  
          } else {
              alert('An unexpected error occurred. Please try again.');
          }
    } finally {
        setLoading(false);
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
          onChangeText={setUsername}
          placeholderTextColor="#888"
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
        <TouchableOpacity style={styles.forgot} onPress={() => setModalVisible(true)}>
          <Text style={styles.forgotPass}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.register} onPress={() => router.navigate(`/pages/register`)}>
          <Text style={styles.already}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Forgot Password */}
      <ForgotPasswordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
