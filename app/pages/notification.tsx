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
import * as Location from 'expo-location';
import { collection, onSnapshot, getFirestore } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";

const db = getFirestore(app);

interface Report {
  id: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  is_emergency: string;
  report_date: string;
}

const bgImage = require("@/assets/images/bgImage.png");

const { height, width } = Dimensions.get("window");

const types = ["Emergency", "Road blockage", "Weather"];

const NotificationItem: React.FC<{ content: string; type: string; time: string }> = ({
  content,
  type,
  time,
}) => (
  <TouchableOpacity className="w-full bg-white my-2 p-4 rounded-lg shadow">
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
        <Text className="text-xl font-semibold text-slate-500 mb-2">{content}</Text>
        <Text className="text-md font-semibold text-slate-500">{time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function NotificationForm() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location.coords);
        } catch (error) {
          console.error("Error getting location:", error);
        }
      }
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const categories = ["fires", "potholes", "floods", "road accident", "street light", "others"];
    const unsubscribeArray = categories.map((category) =>
      onSnapshot(collection(db, `reports/${category}/reports`), (snapshot) => {
        const newReports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report));
        const nearbyReports = newReports.filter((report) => {
          const distance = haversineDistance(userLocation, {
            latitude: report.longitude,
            longitude: report.latitude,
          });
          return distance <= 100; // Reports within 100 meters
        });
        setReports((prevReports) => [...prevReports, ...nearbyReports]);
      })
    );

    return () => unsubscribeArray.forEach((unsubscribe) => unsubscribe && unsubscribe());
  }, [userLocation]);

  const haversineDistance = (loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) * Math.sin(dLon / 2) ** 2;
    return 6371000 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); // Earth's radius in meters
  };

  return (
    <ImageBackground source={bgImage} className="flex-1 justify-center items-center" resizeMode="cover">
      <SafeAreaView className="flex-1 w-full">
        <View className="flex-row items-center justify-between px-6">
          <Text className="font-bold text-3xl text-white my-4">Notifications</Text>
        </View>
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem content={item.is_emergency} type={item.type_of_report} time={item.report_date} />}
          className="w-full h-auto flex px-8"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
