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
import axios from "axios";
export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { onLogin } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await onLogin!(username, password);
      if (!data) {
        return;
      }
      router.push("/(tabs)/home");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data);
      } else {
        console.log("An unexpected error occurred:", error);
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
            className="w-4/5 bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
            placeholder="Enter your email"
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
          <View className="w-4/5 bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
            <TextInput
              className="w-4/5 text-lg p-3 text-[#0C3B2D] font-semibold items-center justify-center"
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
                color="#888"
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
