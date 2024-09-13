import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import bgImage from "@/assets/images/landing_page.png";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

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
        <TouchableOpacity
          style={styles.enterLogin}
          onPress={() => router.push(`/(tabs)/home`)}
        >
          <Text style={styles.enter}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotPass}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.register}>
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
  password: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
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
  enterLogin: {
    backgroundColor: "#0C3B2D",
    width: "50%",
    padding: 15,
    borderRadius: 20,
    marginBottom: height * 0.05,
  },
  enter: {
    fontSize: RFPercentage(2.5),
    color: "#F0F4C3",
    fontWeight: "bold",
    textAlign: "center",
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
