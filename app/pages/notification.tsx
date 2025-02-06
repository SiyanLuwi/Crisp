import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store'
import {
  collection,
  onSnapshot,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { useAuth } from "@/AuthContext/AuthContext"; // Import your Auth context to get USER_ID
import { useNavigation } from "@react-navigation/native"; // Import useNavigation for navigation
import { router } from "expo-router";
import { scheduleNotification } from "../utils/notifications";

const db = getFirestore(app);

const bgImage = require("@/assets/images/bgImage.png");
interface Notification {
  id: string;
  title: string;
  description: string;
  screen: string;  // Add other fields you expect to use
  createdAt: { seconds: number };
}

const NotificationItem: React.FC<{
  id: string,
  content: string;
  type: string;
  time: string;
  onPress: () => void; // Change event to onPress and make it a function
}> = ({ content, type, time, onPress }) => (
  <TouchableOpacity
    className="w-full bg-white my-2 p-4 rounded-lg shadow"
    onPress={onPress}
  >
    <View className="flex flex-row items-center">
      <View className="border-2 border-[#0C3B2D] bg-[#f0fff2] rounded-full p-4">
        <MaterialCommunityIcons
          name={
            type === "Emergency"
              ? "alert"
              : type === "Weather"
                ? "weather-rainy"
                : "road-variant"
          }
          size={45}
          color="#0C3B2D"
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-lg font-bold text-[#0C3B2D]">{type}</Text>
        <Text className="text-xl font-semibold text-slate-500 mb-2">
          {content}
        </Text>
        <Text className="text-md font-semibold text-slate-500">{time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function NotificationForm() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { USER_ID, near_by_reports } = useAuth();
  const navigation = useNavigation(); // Get the navigation object
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!USER_ID) return;

      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("userId", "==", USER_ID));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        // Extract data with necessary fields
        const fetchedNotifications: Notification[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Make sure that necessary fields exist in the document
          const notification: Notification = {
            id: doc.id,
            title: data.title || "",  // Provide default empty string if field is missing
            description: data.description || "",  // Default empty string
            screen: data.screen || "",  // Default empty string
            createdAt: data.createdAt || { seconds: 0 },  // Default timestamp if missing
          };

          return notification;
        }).filter((notification) => {
          // 3 Days
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          const threeDaysAgo = Date.now() - threeDays;
          return notification.createdAt.seconds * 1000 > threeDaysAgo;
        });
        // Set notifications to the state


        if (fetchedNotifications.length > 0) {
          // Schedule notifications based on the fetched data
          for (const notification of fetchedNotifications) {
            const { title, description, createdAt, screen } = notification;
            const delaySeconds = Math.max(0, Math.floor((new Date(createdAt.seconds * 1000).getTime() - Date.now()) / 1000));
            setNotifications((prev) => [...prev, notification]);
            await scheduleNotification(title, description, delaySeconds, screen);
          }
          await SecureStore.setItemAsync('notificationsFetched', 'true');
        } else {
          await SecureStore.setItemAsync('notificationsFetched', 'false');
        }
      });

      return () => unsubscribe();
    };

    fetchNotifications();
  }, [USER_ID]);

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 w-full">
        <View className="flex-row items-center justify-between px-6">
          <Text className="font-bold text-3xl text-white my-4">
            Notifications
          </Text>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              id={item.id}
              content={item.description}
              type={item.title}
              time={new Date(item.createdAt.seconds * 1000).toLocaleString()}
              onPress={() => router.push(item.screen)}
            />
          )}
          className="w-full h-auto flex px-8"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
