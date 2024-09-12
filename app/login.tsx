import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import bgImage from "@/assets/images/landing_page.png";
import React from "react";
import { router } from "expo-router";

export default function Login() {
  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.bgImage} />
      <View style={styles.loginContainer}>
      <Text style={styles.text}>Welcome Back!</Text>
      <TextInput
        style={styles.username}
        placeholder="Enter your username"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.password}
        placeholder="Enter your password"
        placeholderTextColor="#888"
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.forgot}>
        <Text style={styles.forgotPass}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.enterLogin}>
        <Text style={styles.enter} onPress={() => router.push(`/(tabs)/home`)}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgot}>
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
  },
  loginContainer: {
    position: "absolute",
    bottom: 0,
    paddingVertical: 100,
    backgroundColor: "#F0F4C3",
    width: "100%",
    height: "60%", 
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  bgImage: {
    position: 'absolute',
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  text: {
    color: "#0C3B2D",
    top: -100,
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: 50,
    zIndex: 1,
  },
  username: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: 20,
    top: -80,
    padding: 10,
    borderRadius: 10,
    margin: 10,
    zIndex: 1, 
  },
  password: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: 20,
    top: -80,
    padding: 10,
    borderRadius: 10,
    margin: 20,
    zIndex: 1, 
  },
  forgot: {
    top: -80,
    zIndex: 1,
    left: 80,
  },
  forgotPass: {
    fontSize: 17,
    color: "#0C3B2D"
  },
  enterLogin: {
    position: "absolute",
    backgroundColor: "#0C3B2D",
    width: "50%",
    padding: 10,
    borderRadius: 20,
    bottom: 120,
    zIndex: 1,
  },
  enter: {
    fontSize: 20,
    color: "#F0F4C3",
    fontWeight: "bold",
    textAlign: "center",
  },
  already: {
    position: "absolute",
    top: 120,
    right: 0,
    zIndex: 1,
    alignItems: "center",
  },
});