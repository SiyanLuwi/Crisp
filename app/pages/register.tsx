import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapPicker from "@/components/mapPicker";

const bgImage = require("@/assets/images/landing_page.png");
const { width, height } = Dimensions.get("window");

export default function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [address, setAddress] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handlePasswordChange = (text: string) => {
    if (text.length <= 12) {
      setPassword(text);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (text.length <= 12) {
      setConfirmPassword(text);
    }
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
  }) => {
    // Convert coordinates to address if needed
    setAddress(`Lat: ${location.latitude}, Lng: ${location.longitude}`);
    setShowMapPicker(false); // Close the map picker
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View className="w-full h-full relative items-center justify-center">
        <Image source={bgImage} className="w-full h-full absolute cover" />
        <View className="w-full h-auto bg-[#F0F4C3] flex flex-col rounded-t-3xl justify-center items-center bottom-0 absolute">
          {/* <View className="w-full h-auto bg-white flex flex-col rounded-t-3xl justify-center items-center bottom-0 absolute border-2 border-[#0C3B2D]"> */}
          <View className="w-full flex justify-start items-start">
            <Text className="text-3xl font-extrabold text-[#0C3B2D] my-10 ml-10">
              Create an Account
            </Text>
          </View>
          <TextInput
            className="w-4/5 bg-white text-lg p-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
            placeholder="Enter your name"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            onPress={() => setShowMapPicker(true)}
            className="w-4/5 bg-white mb-2 rounded-lg flex flex-row items-center border border-[#0C3B2D]"
          >
            <TextInput
              className="w-4/5 text-lg p-3 text-[#0C3B2D] font-semibold items-center justify-center"
              placeholder="Enter your address"
              placeholderTextColor="#888"
              value={address}
              editable={false} // Make it non-editable
            />
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#0C3B2D"
            />
          </TouchableOpacity>
          <TextInput
            className="w-4/5 bg-white text-lg p-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
            placeholder="Enter your email"
            placeholderTextColor="#888"
          />
          <TextInput
            className="w-4/5 bg-white text-lg p-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
            placeholder="Enter your phone number"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={11}
          />
          <View className="w-4/5 bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
            <TextInput
              className="w-4/5 text-lg p-3 text-[#0C3B2D] font-semibold items-center justify-center"
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!passwordVisible}
              maxLength={12}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity
              className="text-lg p-3 items-center justify-center"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          <View className="w-4/5 bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
            <TextInput
              className="w-4/5 text-lg p-3 text-[#0C3B2D] font-semibold items-center justify-center"
              placeholder="Confirm your password"
              placeholderTextColor="#888"
              secureTextEntry={!confirmPasswordVisible}
              maxLength={12}
              onChangeText={handleConfirmPasswordChange}
            />
            <TouchableOpacity
              className="text-lg p-3 items-center justify-center"
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <MaterialCommunityIcons
                name={confirmPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {password.length > 0 && password.length < 6 && (
            <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
              Password must be at least 6 characters long.
            </Text>
          )}
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
              Passwords do not match.
            </Text>
          )}
          <TouchableOpacity
            className="mt-5 w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center"
            onPress={() => router.push(`/pages/verifyEmail`)}
          >
            <Text className="text-xl py-1 font-bold text-white">REGISTER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full flex items-center justify-center flex-row mt-6"
            onPress={() => router.navigate(`/pages/login`)}
          >
            <Text className="text-xl text-[#7e9778] mr-3 mt-1 mb-8 font-semibold flex">
              Already an account?
            </Text>
            <Text className="text-xl text-[#0C3B2D] mt-1 mb-8 font-bold flex">
              Login
            </Text>
          </TouchableOpacity>
        </View>
        {showMapPicker && (
          <MapPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
    height: height * 0.67,
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
    marginBottom: height * 0.02,
  },
  name: {
    backgroundColor: "#ffffff",
    width: "80%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  address: {
    flex: 1,
    fontSize: RFPercentage(2.5),
  },
  mapIcon: {
    marginLeft: 10,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "80%",
    borderRadius: 10,
    marginBottom: 10,
  },
  password: {
    flex: 1,
    fontSize: RFPercentage(2.5),
    padding: 10,
  },
  togglePassword: {
    padding: 10,
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
