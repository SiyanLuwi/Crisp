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
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/AuthContext/AuthContext";
import axios from "axios";
const { width, height } = Dimensions.get("window");
interface Prediction {
  class: string;
  class_id: number;
  confidence: number;
}

export default function PictureForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isFetch, setFetch] = useState<any>(null)
  const { createReport } = useAuth();
  
  const getHighestConfidenceClass = (results: Prediction[]): Prediction => {
    return results.reduce((prev, current) => {
        return (prev.confidence > current.confidence) ? prev : current;
    });
} 


  const classify_image = async (uri: any) => {
    try {
      setLoading(true)
      const base64image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const res = await axios({
        method: 'POST',
        url: 'https://detect.roboflow.com/image_classification-wl7xe/1', 
        params: {
          api_key: "6IesEqkK0zYWQS6auxzl", 
        },
        data: base64image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const results = getHighestConfidenceClass(res.data.predictions);     
      setSelectedItem(results.class);
      console.log(results.class)
      console.log(res.data.predictions)
      setLoading(false)
    } catch (error:any) {
        console.log(error.message)
    }
  }


  const report = async () => {
    try {
      if (!location) {
        throw new Error("Location is missing");
      }

      const [longitude, latitude] = location.split(",");

      let category =
        emergency?.toLocaleLowerCase() === "yes"
          ? "emergency"
          : "not emergency";

      if (
        !selectedItem ||
        !description ||
        !longitude ||
        !latitude ||
        !category
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
        category,
        imageUri
      );

      if (res) {
        console.log("Report created successfully:", res);
      }
    } catch (error: any) {
      console.error("Error creating report:", error.message || error);
    }
  };

  const fetchImageUri = async () => {
    try {
      const uri = await SecureStore.getItemAsync("imageUri");
      return uri ? uri : null;
    } catch (error) {
      console.error("Error fetching image URI:", error);
      return null;
    }
  };
  const fetchCurrentLocation = async () => {
    try {
      const latlong = await SecureStore.getItemAsync("currentLocation");
      return latlong ? latlong : null;
    } catch (error) {
      console.error("Error fetching current location:", error);
      return null;
    }
  };

  useEffect(() => {
    const getImageUriAndLocation = async () => {
      const uri = await fetchImageUri();
      const locations = await fetchCurrentLocation();
      setLocation(locations);
      setImageUri(uri);
      setFetch(true)
      classify_image(uri)
    };
    getImageUriAndLocation();
  }, []);
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemPress = (item: string) => {
    setSelectedItem(item);
    setIsOpen(false);
    console.log("Selected Item:", item);
  };

  const data = [
    { id: "1", name: "Street Light" },
    { id: "2", name: "Pot Hole" },
    { id: "3", name: "Fire" },
    { id: "4", name: "Health and Safety Concerns" },
    { id: "5", name: "Road Incidents" },
    { id: "6", name: "Crime" },
  ];

  const confirmCancel = () => {
    setCancelModalVisible(false);
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
  }) => {
    // Convert coordinates to address if needed
    setLocation(`${location.latitude}, ${location.longitude}`);
    setShowMapPicker(false); // Close the map picker
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
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
            <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
              <TextInput
                className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center justify-center"
                placeholderTextColor="#888"
                placeholder="Location"
                value={location?.toString()}
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

            <TextInput
              className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Emergency (yes/no)"
              onChangeText={setEmergency}
            />
            <TouchableOpacity
              onPress={toggleDropdown}
              className="w-full bg-white p-4 rounded-lg mb-4 border border-[#0C3B2D] justify-center"
            >
              <Text className="text-md text-[#0C3B2D] font-semibold">
                {selectedItem ? selectedItem : "Select a type of Report"}
              </Text>
            </TouchableOpacity>

            {/* Dropdown options displayed in Modal */}
            <Modal
              visible={isOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={toggleDropdown}
            >
              <TouchableOpacity
                className="flex-1 justify-center items-center bg-black/50"
                onPress={toggleDropdown}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 20,
                  }}
                >
                  <Text className="text-lg text-[#0C3B2D] font-bold mb-3">
                    Select a Type of Report
                  </Text>
                  <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleItemPress(item.name)}
                        className="w-full p-2 border-b border-[#0C3B2D]"
                      >
                        <Text className="text-md font-semibold py-2">
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            <TextInput
              className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
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
            <TouchableOpacity
              className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
              onPress={report}
            >
              <Text className="text-xl py-1 font-bold text-white">
                Submit Report
              </Text>
            </TouchableOpacity>

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
