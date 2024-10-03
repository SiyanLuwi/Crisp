import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function PictureForm() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView className="w-full h-full flex flex-col justify-center items-center bg-[#0C3B2D]">
        <ScrollView className="w-full h-full flex bg-[#0C3B2D] p-6">
          <Text className="font-bold text-4xl text-white mt-3 mb-4 ml-4">
            Make a Report
          </Text>
          <View className="justify-center items-center px-3 mt-3">
            <View className="w-full h-auto">
              {/* Replace with actual image source if needed */}
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
              />
            </View>
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mt-4 mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Location"
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Emergency (yes/no)"
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Type of Report"
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Description"
              multiline={true}
              scrollEnabled={true}
              style={{
                maxHeight: 150, // Adjust this value as needed
                height: 150,
              }}
            />
            <TouchableOpacity
              className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
              onPress={() => console.log("Report Submitted")}
            >
              <Text className="text-xl py-1 font-bold text-white">
                Submit Report
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
              onPress={() => router.back()}
            >
              <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-xl py-1 font-boldtext-[#0C3B2D]">.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
