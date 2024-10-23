import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";
import DeleteReportModal from "@/components/deleteReport";
const bgImage = require("@/assets/images/bgImage.png");
import { app } from "@/firebase/firebaseConfig";
import { getFirestore,collection, onSnapshot } from "firebase/firestore";
import * as SecureStore from "expo-secure-store";

const db = getFirestore(app)
const { height, width } = Dimensions.get("window");

const posts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  imageUri: "https://via.placeholder.com/150",
  location: `Image Location ${index + 1}`,
  type: `Image Type ${index + 1}`,
  description: `Image Description ${index + 1}`,
}));
interface Report {
  id: string;
  user_id: string;
  username: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  upvote: number;
  downvote: number;
  report_date: string;
}
export default function ManageReports() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllDocuments = async () => {
    const categories = [
      "fires",
      "street lights",
      "potholes",
      "floods",
      "others",
      "road incidents",
    ];
  
    // Retrieve the user ID securely
    const user_id = await SecureStore.getItemAsync('user_id');
    console.log("User ID:", user_id);
  
    // Create an array to hold unsubscribe functions
    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        (snapshot) => {
          const reports: Report[] = snapshot.docs
            .map((doc) => {
              const data = doc.data() as Omit<Report, "id">; // Omit the id when fetching data
              return {
                id: doc.id, // Include the document ID (UUID)
                user_id: data.user_id,
                username: data.username || "", // Default to empty string if missing
                type_of_report: data.type_of_report || "",
                report_description: data.report_description || "",
                longitude: data.longitude || 0, // Default to 0 if missing
                latitude: data.latitude || 0, // Default to 0 if missing
                category: category, // Set the category based on the current loop
                image_path: data.image_path || "", // Default to empty string if missing
                upvote: data.upvote || 0, // Default to 0 if missing
                downvote: data.downvote || 0, // Default to 0 if missing
                report_date: data.report_date || "", // Default to empty string if missing
              };
            })
            .filter((report) => report.user_id.toString() == user_id?.toString()); // Filter by user_id
  
          // Sort reports by report_date in descending order
          const sortedReports = reports.sort((a, b) => {
            const dateA = new Date(a.report_date).getTime();
            const dateB = new Date(b.report_date).getTime();
            return dateB - dateA; // Sort in descending order
          });

  
          // Update the reports state with new reports from this category
          setReports((prevReports) => [
            ...prevReports,
            ...sortedReports,
          ]);
        },
        (error) => {
          console.error(`Error fetching reports from ${category}:`, error);
        }
      );
    });
  
    // Return a cleanup function to unsubscribe from all listeners
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = await fetchAllDocuments();
      return unsubscribe; // Return the unsubscribe function for cleanup
    };
  
    fetchData().catch((error) => {
      console.error("Error in fetching documents:", error);
    });
  }, []);


  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        {/* <Image source={bgImage} className="absolute w-full h-full z-0" /> */}
        <View className="flex flex-row h-auto w-full items-center justify-between px-6">
          <Text className="font-bold text-4xl text-white mt-3 mb-2">
            Manage Reports
          </Text>
          <TouchableOpacity onPress={() => router.push("/pages/notification")}>
            <MaterialCommunityIcons
              name="bell"
              size={RFPercentage(3.5)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={reports}
          keyExtractor={(item, index) => `${item.id} - ${index}`}
          className="w-full h-auto flex p-4 "
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white  w-auto rounded-[20px] mx-3 p-4 my-2 mb-4">
              <View className="flex flex-row w-full items-center ">
                <MaterialCommunityIcons
                  name="account-circle"
                  size={RFPercentage(5)}
                  style={{ padding: 5, color: "#0C3B2D" }}
                />
                <View className="flex flex-col items-start">
                  <Text className="pl-3 text-xl font-bold">{item.username}</Text>
                  <Text className="pl-3 text-md font-bold text-slate-500">
                    12:51
                  </Text>
                </View>
              </View>
              <View className="w-full flex flex-row mt-2">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Location:
                </Text>
                <Text className="text-lg text-left">{" " + item.latitude + ", " + item.longitude}</Text>
              </View>
              <View className="w-full flex flex-row">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Type of Report:
                </Text>
                <Text className="text-lg text-left">{item.type_of_report}</Text>
              </View>
              <View className="w-full flex flex-row">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Description:
                </Text>
                <Text className="text-lg text-left flex-1">
                  {item.report_description}
                </Text>
              </View>
              <Image
                source={{ uri: item.image_path }}
                className="w-full h-72 rounded-lg my-1"
              />
              <View className="w-full flex flex-row mt-2 justify-between">
                <View className="flex flex-row items-center">
                  <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons
                      name="thumb-up-outline"
                      size={width * 0.06} // Responsive icon size
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                  <Text className="text-lg mx-1">{item.upvote}</Text>
                  <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons
                      name="thumb-down-outline"
                      size={width * 0.06} // Responsive icon size
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                  <Text className="text-lg mx-1">{item.downvote}</Text>
                </View>
                <View className="flex flex-row items-center">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => setDeleteModalVisible(true)}
                  >
                    <MaterialCommunityIcons
                      name="format-align-justify"
                      size={width * 0.06} // Responsive icon size
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
        <TouchableOpacity className="p-2">
          <MaterialCommunityIcons
            name="thumb-down-outline"
            size={width * 0.15} // Responsive icon size
            color="#0C3B2D"
          />
        </TouchableOpacity>

        <DeleteReportModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)} // Hide modal
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
