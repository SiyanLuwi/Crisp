import React, { useEffect } from "react";
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
import axios from "axios";
import * as SecureStore from "expo-secure-store";
const bgImage = require("@/assets/images/landing_page.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const TOKEN_KEY = "my-jwt";
const REFRESH_KEY = "my-jwt-refresh";
const EXPIRATION = "accessTokenExpiration";

// const checkToken = async () => {
//   const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
//   const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
//   const expiration = await SecureStore.getItemAsync(EXPIRATION);

//   const currentTime = Date.now();

//   if (!accessToken || !expiration || currentTime > parseInt(expiration)) {
//     // Token is expired or not present
//     if (refreshToken) {
//       return await refreshAccessToken(refreshToken);
//     }
//     return null; // No valid token available
//   }

//   return accessToken; // Token is valid
// };

// const refreshAccessToken = async (refreshToken: string) => {
//   try {
//     const response = await axios.post('your_refresh_token_endpoint', { refresh: refreshToken });
//     const newAccessToken = response.data.access;

//     // Update the access token in SecureStore
//     await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);

//     // Update the Axios header
//     axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

//     return newAccessToken; // Return the new access token
//   } catch (error) {
//     console.error('Failed to refresh access token:', error);
//     return null; // Handle error accordingly
//   }
// };

export default function Index() {
  // useEffect(() => {
  //   const handleAuthentication = async () => {
  //     const accessToken = await checkToken();
  //     if (accessToken) {
  //       router.push("/(tabs)/home");
  //     } else {
  //       router.push("/pages/login");
  //     }
  //   };

  //   handleAuthentication();
  // }, []);

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
