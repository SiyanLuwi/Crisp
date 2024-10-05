import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";

const { height } = Dimensions.get("window");

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const { onVerifyEmail } = useAuth();
  const handleOtpChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(text) && text.length <= 6) {
      setOtp(text);
    }
  };

  const sendOtp = async () => {
    try {
      const email = await SecureStore.getItemAsync("email");
      if (!email) {
        throw new Error("Email is missing!");
      }
      await onVerifyEmail!(email, otp);
    } catch (error) {}
  };

  return (
    <View className="w-full h-full bg-[#F0F4C3] justify-center items-center p-5">
      <Text className="text-4xl text-[#0C3B2D] font-extrabold w-full flex text-left pl-10 mb-2">
        Verify your Email
      </Text>
      <Text className="text-md text-[#7e9778] font-bold w-full flex text-left px-10 mb-10">
        CRISP has sent you an OTP to verify your email address.
      </Text>
      <TextInput
        className="w-4/5 bg-white text-lg p-3 rounded-lg mb-3 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D] flex text-center"
        placeholder="Enter OTP"
        placeholderTextColor="#888"
        keyboardType="numeric"
        maxLength={6}
        onChangeText={handleOtpChange}
        value={otp}
      />
      <TouchableOpacity
        className="w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center"
        onPress={sendOtp}
      >
        <Text className="text-xl py-1 font-bold text-white">Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
