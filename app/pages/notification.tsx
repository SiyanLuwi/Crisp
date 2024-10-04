import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

// Generate random notifications
const types = ["Emergency", "Road blockage", "Weather"];
const notifications = Array.from({ length: 20 }, (_, index) => {
  const type = types[Math.floor(Math.random() * types.length)];
  const content =
    type === "Emergency"
      ? `Emergency Alert: Event ${index + 1}`
      : type === "Road blockage"
      ? `Road Blockage: Event ${index + 1}`
      : `Weather Update: Event ${index + 1}`;
  const time = `Time: ${new Date().toLocaleTimeString()}`; // Example time string
  return { id: index.toString(), type, content, time };
});

interface NotificationItemProps {
  content: string;
  type: string;
  time: string; // Added time to props
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  content,
  type,
  time,
}) => (
  <TouchableOpacity className="w-full bg-white my-2 p-4 rounded-lg shadow">
    <View className="flex flex-row items-center">
      <View className="border-2 border-[#0C3B2D] rounded-full p-4">
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
  return (
    <SafeAreaView className="flex-1 bg-[#0C3B2D]">
      <View className="flex-row items-center justify-between px-6">
        <Text className="font-bold text-3xl text-white my-4">
          Notifications
        </Text>
      </View>
      <FlatList
        data={notifications}
        showsVerticalScrollIndicator={false}
        className="w-full h-auto flex px-8"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            content={item.content}
            type={item.type}
            time={item.time}
          />
        )}
      />
    </SafeAreaView>
  );
}
