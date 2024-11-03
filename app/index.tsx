import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform 
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import api from "./api/axios";
import { app } from "@/firebase/firebaseConfig";
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device';
import Constants from 'expo-constants';
const bgImage = require("@/assets/images/landing_page.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const TOKEN_KEY = "my-jwt";
const REFRESH_KEY = "my-jwt-refresh";
const EXPIRATION = "accessTokenExpiration";
const PUSH_TOKEN = "pushToken";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


const checkToken = async () => {
  const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  const expiration = await SecureStore.getItemAsync(EXPIRATION);

  const currentTime = Date.now();
 

  // Check if access token is missing or expired
  if (!accessToken || !expiration || currentTime > parseInt(expiration)) {
    // Check if refresh token is also missing or expired
    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (!newAccessToken) {
        // Both access and refresh tokens are invalid
        // Handle logout or re-authentication here
        console.log('Both tokens are invalid, prompting login...');
        return null; 
      }
      return newAccessToken;
    }
    // No tokens available
    return null; 
  }

  return accessToken; 
};


const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await api.post('api/token/refresh/', { refresh: refreshToken })
    const newAccessToken = response.data.access;

    await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);

    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

    return newAccessToken; 
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null; 
  }
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();



  useEffect(() => {
    const handleAuthentication = async () => {
      const accessToken = await checkToken();
      if (accessToken) {
        router.push("/(tabs)/home");
      } 
    };
    handleAuthentication();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [])

  
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

    
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
          onPress={() => {router.navigate(`/pages/login`)}}
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

