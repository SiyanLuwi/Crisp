// PhoneCallScreen.jsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";

export default function Outgoing() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  // Sample data for the outgoing call UI
  const callerName = "John Doe";
  const callerImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Use a placeholder image

  const handleEndCall = () => {
    // Logic for ending the call
    router.push("/(tabs)_employee/reports");
    console.log("Call Ended");
  };

  const handleMute = () => {
    // Logic for muting the call
    setIsMicOn(!isMicOn); // Flip the state between true and false
    console.log(isMicOn ? "Microphone Off" : "Microphone On");
  };

  const handleSpeaker = () => {
    // Toggle the speaker state
    setIsSpeakerOn(!isSpeakerOn); // Flip the state between true and false
    console.log(isSpeakerOn ? "Speaker Volume Low" : "Speaker Volume High");
  };

  return (
    <View className="flex-1 bg-blue-900 justify-between px-12 py-20">
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
        <Text className="mt-2 text-lg text-gray-400">Calling...</Text>
      </View>

      {/* Buttons (Mute, End Call, Speaker) */}
      <View className="flex-row justify-between mt-8">
        {/* Mute Button */}
        <TouchableOpacity
          onPress={handleMute}
          className="w-24 h-24 bg-gray-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name={isMicOn ? "microphone-off" : "microphone"}
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="w-24 h-24 bg-red-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          onPress={handleSpeaker}
          className="w-24 h-24 bg-gray-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name={isSpeakerOn ? "volume-high" : "volume-low"} // Toggle between volume-high and volume-mute
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
