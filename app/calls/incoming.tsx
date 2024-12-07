import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";

export default function Incoming() {
  // Sample data for the caller UI
  const callerName = "John Doe";
  const callerImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Use a placeholder image

  const handleEndCall = () => {
    // Logic for ending the call
    router.back();
    console.log("Call Ended");
  };

  const handleAnswerCall = () => {
    // Logic for answering the call
    router.push("/calls/outgoing");
    console.log("Call Answered");
  };

  return (
    <View className="flex-1 bg-[#1A1A1A] justify-between px-12 py-20">
      <StatusBar style="light" />

      {/* Caller Information */}
      <View className="items-center mt-5">
        <MaterialCommunityIcons
          name="account-circle"
          size={RFPercentage(16)}
          style={{ padding: 5, color: "#fff" }}
        />
        {/* <Image
          source={{ uri: callerImage }}
          className="w-32 h-32 rounded-full border-4 border-white"
        /> */}
        <Text className="mt-4 text-3xl text-white font-bold">{callerName}</Text>
        <Text className="mt-2 text-lg text-gray-400">Incoming Call</Text>
      </View>

      {/* Buttons (Answer/Decline) */}
      <View className="flex-row justify-between mt-8">
        {/* Decline Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="w-24 h-24 bg-red-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          onPress={handleAnswerCall}
          className="w-24 h-24 bg-green-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
