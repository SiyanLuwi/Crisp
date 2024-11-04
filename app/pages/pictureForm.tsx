import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CancelModal from "@/components/cancelModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const bgImage = require("@/assets/images/bgImage.png");
import MapPicker from "@/components/mapPicker";
import * as SecureStore from "expo-secure-store";
import LoadingButton from "@/components/loadingButton";
import { useAuth } from "@/AuthContext/AuthContext";
import * as Location from "expo-location"; // Import Location
import * as Notifications from "expo-notifications";
const { width, height } = Dimensions.get("window");

export default function PictureForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState<string | null>(null);
  const [customType, setCustomType] = useState<string>("");
  const [floorNumber, setFloorNumber] = useState<string>("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isFetch, setFetch] = useState<any>(null);
  const { createReport } = useAuth();

  const report = async () => {
    try {
      setLoading(true);
      if (!location) {
        throw new Error("Location is missing");
      }

      const [latitude, longitude] = location.split(",");

      let is_emergency =
        isEmergency?.toLocaleLowerCase() === "Emergency"
          ? "emergency"
          : "not emergency";

      if (
        !selectedItem ||
        !description ||
        !longitude ||
        !latitude ||
        !is_emergency
      ) {
        throw new Error("Some required fields are missing");
      }

      if (!createReport) {
        throw new Error("createReport function is not defined");
      }

      if (!imageUri) {
        throw new Error("Image Uri is not valid! or Null");
      }

      const res = await createReport(
        selectedItem,
        description,
        longitude,
        latitude,
        is_emergency,
        imageUri,
        customType,
        floorNumber
      );

      if (res) {
        setLoading(false);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `You've reported ${selectedItem} incident`,
            body: "Thank you for caring!",
            // data: { data: 'goes here', test: { test1: 'more data' } },
          },
          trigger: { seconds: 2 },
        });
        setReportResult(res);
        handleReportSuccess();
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error creating report:", error.message || error);
    }
  };

  const handleReportSuccess = () => {
    setLoading(false);
    setSuccessModalVisible(true);
    router.push("/(tabs)/reports");
    console.log("Report created successfully:", reportResult);
  };

  const fetchData = async () => {
    try {
      const [uri, locations, report_type, isEmergency] = await Promise.all([
        SecureStore.getItemAsync("imageUri"),
        SecureStore.getItemAsync("currentLocation"),
        SecureStore.getItemAsync("report_type"),
        SecureStore.getItemAsync("isEmergency"),
      ]);

      setIsEmergency(isEmergency);
      setSelectedItem(report_type);
      setLocation(locations);
      setImageUri(uri);
      setFetch(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setSelectedItem(null);
    fetchData();
  }, []);

  const confirmCancel = () => {
    setCancelModalVisible(false);
  };

  // Function to convert coordinates to address
  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return `${result.name}, ${result.city}, ${result.region}, ${result.country}`;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    const address = await getAddressFromCoordinates(
      location.latitude,
      location.longitude
    );
    setLocation(address); // Set the location to the text-based address
    setShowMapPicker(false); // Close the map picker
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust based on your header size
        >
          <ScrollView className="w-full h-full flex p-6">
            <Text className="font-bold text-4xl text-white mt-3 mb-4 ml-4">
              Make a Report
            </Text>
            <View className="justify-center items-center px-3 mt-3">
              <View className="w-full h-auto">
                {imageUri ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(imageUri);
                      setFullImageModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: "https://via.placeholder.com/150" }}
                    className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
                  />
                )}
              </View>
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Location</Text>
              </View>
              <View className="w-full bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                <TextInput
                  className="w-4/5 text-md p-2 text-[#0C3B2D] font-semibold items-center justify-center"
                  placeholderTextColor="#888"
                  placeholder="Location"
                  value={location || ""}
                  editable={false} // Make it read-only
                />
                <TouchableOpacity
                  onPress={() => setShowMapPicker(true)}
                  className="text-lg p-3 items-center justify-center"
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color="#0C3B2D"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Type of Report:</Text>
              </View>
              <TextInput
                className="w-full bg-white p-4 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                value={selectedItem || ""}
                editable={false}
              />

              {/* Conditionally render TextInput if "Other" is selected */}
              {selectedItem === "Others" && (
                <TextInput
                  className="w-full bg-white p-4 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                  placeholder="Please specify..."
                  placeholderTextColor={"#888"}
                  value={customType}
                  onChangeText={setCustomType}
                />
              )}

              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">
                  If in a Building Specify the Floor Number:
                </Text>
              </View>
              <TextInput
                className="w-full bg-white p-4 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                placeholder="Please specify..."
                placeholderTextColor={"#888"}
                value={floorNumber}
                onChangeText={setFloorNumber}
                keyboardType="numeric"
              />
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Description:</Text>
              </View>
              <TextInput
                className="w-full bg-white text-md p-4 rounded-lg items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                placeholderTextColor="#888"
                placeholder="Description"
                multiline={true}
                scrollEnabled={true}
                style={{
                  maxHeight: 150,
                  height: 150,
                }}
                onChangeText={setDescription}
              />
              <LoadingButton
                style="mt-5 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
                title="Submit Report"
                onPress={report}
                loading={loading}
              />

              <TouchableOpacity
                className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                onPress={() => {
                  setCancelModalVisible(true);
                }}
              >
                <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-xl py-1 font-bold text-[#0C3B2D]">.</Text>
            </View>

            {/* Cancel Modal */}
            <CancelModal
              visible={cancelModalVisible}
              onConfirm={confirmCancel}
              onCancel={() => setCancelModalVisible(false)}
            />
          </ScrollView>

          <Modal
            visible={successModalVisible}
            transparent={true}
            animationType="fade"
          >
            <TouchableWithoutFeedback
              onPress={() => setSuccessModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                  <View className="full p-3 bg-white rounded-xl items-start">
                    <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                      Report has been created successfully!
                    </Text>
                    <View className="flex flex-row justify-end mt-3 w-full">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                        onPress={() => setSuccessModalVisible(false)} // Close the modal here
                      >
                        <Text className="text-md font-semibold text-white px-4">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

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
                      width: width * 0.9, // 90% of screen width
                      height: height * 0.55, // 60% of screen height
                      borderRadius: 10,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showMapPicker && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/50">
          <MapPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
          />
        </View>
      )}
    </ImageBackground>
  );
}
