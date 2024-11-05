import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import FeedbackModal from "@/components/feedback";
const bgImage = require("@/assets/images/bgImage.png");
import { router } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
const { height, width } = Dimensions.get("window");

const db = getFirestore(app);

interface Report {
  id: string;
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

export default function Reports() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [username, setUsername] = useState<string | null>("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllDocuments = async () => {
    const categories = [
      "fires",
      "street lights",
      "potholes",
      "floods",
      "others",
      "road incidents",
    ];

    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        (snapshot) => {
          const reports: Report[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Omit<Report, "id">; // Omit the id when fetching data
            return {
              id: doc.id, // Include the document ID this is an UUID
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
          });

          const sortedReports = reports.sort((a, b) => {
            const dateA = new Date(a.report_date).getTime();
            const dateB = new Date(b.report_date).getTime();
            return dateB - dateA;
          });
          setReports((prevReports) => {
            const existingReports = prevReports.filter(
              (report) => report.category !== category
            );
            return [...existingReports, ...sortedReports]; // Replace old reports of this category and add the sorted new ones
          });
        },
        (error) => {
          console.error(`Error fetching reports from ${category}:`, error);
        }
      );
    });
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

  const loadReports = async () => {
    setRefreshing(true); // Start refreshing
    await fetchAllDocuments(); // Fetch the reports
    setRefreshing(false); // Stop refreshing
  };

  useEffect(() => {
    loadReports(); // Load reports on component mount
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status === "granted") {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log("Location permission denied");
        setLocationPermissionGranted(false);
        setRegion(null);
      }
    };

    const getCurrentLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    requestLocationPermission();
  }, []);

  const renderItem = ({ item }: { item: Report }) => {
    const [datePart, timePart] = item.report_date.split("T");
    const formattedDate = datePart.replace(/-/g, "/");
    const formattedTime = timePart.split(".")[0];

    return (
      <View className="bg-white w-auto rounded-[20px] mx-3 p-4 my-2 mb-4">
        <View className="flex flex-row w-full items-center">
          <MaterialCommunityIcons
            name="account-circle"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#0C3B2D" }}
          />
          <View className="flex flex-col items-start">
            <Text className="pl-3 text-xl font-bold">{item.username}</Text>
            <Text className="pl-3 text-md font-bold text-slate-500">
              {formattedDate} {"\n"}
              <Text className="text-md font-normal text-slate-500">
                {formattedTime}
              </Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedReport(item);
            setModalVisible(true);
          }}
          className="w-full flex flex-row mt-2"
        >
          <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
            Location:
            <Text className="text-lg font-normal text-black ml-2">
              {" " + item.latitude + ", " + item.longitude}
            </Text>
          </Text>
        </TouchableOpacity>
        <View className="w-full flex flex-row">
          <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
            Type of Report:
            <Text className="text-lg font-normal text-black ml-2">
              {" " + item.type_of_report}
            </Text>
          </Text>
        </View>
        <View className="w-full flex flex-row">
          <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
            Description:
            <Text className="text-lg font-normal text-black ml-2">
              {" " + item.report_description}
            </Text>
          </Text>
        </View>
        {item.image_path ? (
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(item.image_path);
              setFullImageModalVisible(true);
            }}
          >
            <Image
              source={{ uri: item.image_path }}
              className="w-full h-72 rounded-lg my-1 border-2 border-[#0C3B2D]"
            />
          </TouchableOpacity>
        ) : null}
        <View className="flex flex-row justify-end w-full mt-3">
          <TouchableOpacity
            className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
            // onPress={onConfirm}
            onPress={() => {
              setFeedbackModalVisible(true);
              // onConfirm();
              // router.back();
            }}
          >
            <Text className="text-md font-extrabold text-white px-5">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <View className="flex flex-row h-auto w-full items-center justify-between px-6">
          <Text className="font-bold text-4xl text-white mt-3 mb-2">
            Reports
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
          keyExtractor={(item, index) => `${item.id}-${index}}`}
          className="w-full h-auto flex p-4"
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Control refreshing state
              onRefresh={loadReports} // Trigger loadReports on refresh
            />
          }
          ListFooterComponent={
            <Text
              style={{ padding: 45, color: "white", textAlign: "center" }}
            ></Text>
          }
        />

        {/* Full Screen Image Modal */}
        <Modal
          visible={fullImageModalVisible}
          transparent={true}
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() => setFullImageModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
              }}
            >
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: width * 0.9,
                    height: height * 0.55,
                    borderRadius: 10,
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={{
                    width: width * 0.9,
                    height: height * 0.55,
                    backgroundColor: "white",
                    borderRadius: 10,
                  }}
                >
                  {selectedReport && (
                    <MapView
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                      }}
                      initialRegion={{
                        latitude: selectedReport.latitude,
                        longitude: selectedReport.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={userLocation}
                        title={"You are here"}
                        pinColor="blue"
                      />
                      <Marker
                        coordinate={{
                          latitude: selectedReport.latitude,
                          longitude: selectedReport.longitude,
                        }}
                        title={selectedReport.type_of_report}
                      />
                    </MapView>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)} // Hide modal
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
