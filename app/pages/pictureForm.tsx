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
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CancelModal from "@/components/cancelModal";
import * as SecureStore from 'expo-secure-store'

const { width, height } = Dimensions.get("window");

export default function PictureForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const fetchImageUri = async () => {
    try {
      const uri = await SecureStore.getItemAsync('imageUri');
      return uri ? uri : null; 
    } catch (error) {
      console.error("Error fetching image URI:", error);
      return null; 
    }
  };
  const fetchCurrentLocation = async () => {
    try {
      const latlong = await SecureStore.getItemAsync('currentLocation')
      return latlong ? latlong : null
    } catch (error) {
      console.error("Error fetching current location:", error);
      return null; 
    }
  }

  useEffect(() => {
    const getImageUriAndLocation = async () => {
      const uri = await fetchImageUri();
      const locations = await fetchCurrentLocation()
      setLocation(locations);
      setImageUri(uri); 
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView className="w-full h-full flex flex-col justify-center items-center bg-[#0C3B2D]">
        <ScrollView className="w-full h-full flex bg-[#0C3B2D] p-6">
          <Text className="font-bold text-4xl text-white mt-3 mb-4 ml-4">
            Make a Report
          </Text>
          <View className="justify-center items-center px-3 mt-3">
            <View className="w-full h-auto">
              {imageUri ? <Image
                source={{ uri: imageUri }}
                className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
              /> :
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
              />
              }
            </View>
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mt-4 mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Location"
              value={location?.toString()}
            />
            
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Emergency (yes/no)"
            />
            <TouchableOpacity
              onPress={toggleDropdown}
              className="w-full bg-white p-3 rounded-lg mb-4 border border-[#0C3B2D] justify-center"
            >
              <Text className="text-lg text-[#0C3B2D] font-semibold">
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
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Description"
              multiline={true}
              scrollEnabled={true}
              style={{
                maxHeight: 150,
                height: 150,
              }}
            />
            <TouchableOpacity
              className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
              onPress={() => {
                router.push("/(tabs)/reports"); // Call the onClose function
                console.log("Report Submitted"); // Log the message
              }}
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
