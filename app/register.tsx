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
import React, { useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
const bgImage = require("@/assets/images/landing_page.png");
const { width, height } = Dimensions.get("window");
export default function register() {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (text: string) => {
    if (text.length <= 12) {
      setPassword(text);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.bgImage} />
      <View style={styles.registerContainer}>
        <Text style={styles.text}>Create an Account</Text>
        <TextInput
          style={styles.name}
          placeholder="Enter your name"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.address}
          placeholder="Enter your address"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.email}
          placeholder="Enter your email"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.number}
          placeholder="Enter your phone number"
          placeholderTextColor="#888"
          keyboardType="numeric"
          maxLength={11}
        />
        <TextInput
          style={styles.password}
          placeholder="Enter your password"
          placeholderTextColor="#888"
          secureTextEntry={true}
          maxLength={12}
          onChangeText={handlePasswordChange}
        />
        {password.length > 0 && password.length < 6 && (
          <Text style={styles.errorText}>
            Password must be at least 6 characters long.
          </Text>
        )}
        <TouchableOpacity
          style={styles.enterRegister}
          onPress={() => router.push(`/login`)}
        >
          <Text style={styles.enter}>REGISTER</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.register}
          onPress={() => router.navigate(`/login`)}
        >
          <Text style={styles.already}>Already have an account? Login Now</Text>
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
  registerContainer: {
    position: "absolute",
    bottom: 0,
    paddingVertical: height * 0.1,
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
  name: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  address: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  email: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  number: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  password: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
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
  enterRegister: {
    backgroundColor: "#0C3B2D",
    width: "50%",
    padding: 15,
    borderRadius: 20,
    marginBottom: height * 0.01,
    marginTop: height * 0.01,
  },
  enter: {
    fontSize: RFPercentage(2.5),
    color: "#F0F4C3",
    fontWeight: "bold",
    textAlign: "center",
  },
  register: {
    marginTop: height * 0.01,
  },
  already: {
    fontSize: RFPercentage(2.5),
    color: "#0C3B2D",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: RFPercentage(2.5),
  },
});
