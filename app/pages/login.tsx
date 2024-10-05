import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingButton from "@/components/loadingButton";
import ForgotPasswordModal from "@/components/forgotPassModal";
import { useAuth } from "@/AuthContext/AuthContext";
const bgImage = require("@/assets/images/landing_page.png");
// Get screen dimensions
const { height } = Dimensions.get("window");
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { onLogin } = useAuth();
  const IS_EMAIL_VERIFIED = "is_email_verified";

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await onLogin!(username, password);
      const is_email_verified = await SecureStore.getItemAsync(
        IS_EMAIL_VERIFIED
      );
      if (is_email_verified !== "true") {
        router.push("/pages/verifyPage");
        return;
      }
      router.push("/(tabs)/home");
    } catch (error: any) {
      if (error.message === "Invalid username or password") {
        alert("Login failed: Invalid username or password");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust this value if needed
    >
      <View className="w-full h-full relative items-center justify-center">
        <Image source={bgImage} className="w-full h-full absolute cover" />
        <View className="w-full h-auto bg-[#F0F4C3] flex flex-col rounded-t-3xl justify-center items-center bottom-0 absolute">
          <View className="w-full flex justify-start items-start">
            <Text className="text-3xl font-extrabold text-[#0C3B2D] my-10 ml-10">
              Welcome Back!
            </Text>
          </View>
          <TextInput
            className="w-4/5 bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
            placeholder="Enter your email"
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
          <View className="w-4/5 bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
            <TextInput
              className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center justify-center"
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="text-lg p-3 items-center justify-center"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="#0C3B2D"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="w-full flex items-end justify-end mr-24"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-lg text-[#0C3B2D] mt-1 mb-8 font-semibold flex">
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <LoadingButton
            title="LOGIN"
            onPress={handleLogin}
            loading={loading}
          />
          <TouchableOpacity
            className="w-full flex items-center justify-center flex-row mt-20"
            onPress={() => router.navigate(`/pages/register`)}
          >
            <Text className="text-xl text-[#7e9778] mr-3 mt-1 mb-8 font-semibold flex">
              Don't have an account?
            </Text>
            <Text className="text-xl text-[#0C3B2D] mt-1 mb-8 font-bold flex">
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Forgot Password */}
        <ForgotPasswordModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
