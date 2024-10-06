import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
const bgImage = require("@/assets/images/landing_page.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

export default function Index() {
  return (
    <View className="flex w-full h-full relative items-center justify-center">
      <Image source={bgImage} className="w-full h-full " />
      <View className="absolute left-[10%] bottom-[25%] w-full flex flex-col justify-start items-start">
        <Text className=" text-white font-semibold text-left text-7xl mt-5">
          CRISP
        </Text>
        <Text className=" text-white font-bold text-left text-md mt-2">
          (Community Reporting Interface{"\n"}for Safety and Protection)
        </Text>
        <Text className=" text-white font-semibold text-left text-lg mt-2">
          A Smarter Way to protect{"\n"}Your Neighborhood
        </Text>
      </View>
      <View className="absolute left-[10%] right-[10%] bottom-[8%] w-full flex flex-col justify-start items-start">
        <TouchableOpacity
          className="mt-5 w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg border-2 justify-center items-center border-[#8BC34A]"
          onPress={() => router.navigate(`/pages/login`)}
        >
          <Text className="text-xl py-1 font-bold text-white">LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-5 w-full max-w-[80%] bg-[#8BC34A] text-[#0C3B2D] rounded-xl p-2 shadow-lg border-2 justify-center items-center border-[#8BC34A]"
          onPress={() => router.navigate(`/pages/register`)}
        >
          <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
            REGISTER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
