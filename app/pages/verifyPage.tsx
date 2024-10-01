import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function VerifyPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [idPicture, setIdPicture] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleVerify = () => {
    console.log("Verifying with inputs:", {
      name,
      address,
      birthday,
      idNumber,
      selfie,
      idPhoto,
      idPicture,
    });
    setModalVisible(true); // Show modal when verifying

    // Simulate verification process
    setTimeout(() => {
      setModalVisible(false); // Close modal
      router.back(); // Navigate back after verification
    }, 2000); // Auto close modal after 2 seconds (for demonstration)
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setIdPhoto(result.assets[0].uri);
      }
    }
  };

  const takeSelfie = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setSelfie(result.assets[0].uri);
      }
    }
  };

  const takeIdPicture = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setIdPicture(result.assets[0].uri);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView className="w-full h-full flex flex-col justify-center items-center bg-[#0C3B2D]">
        <View className="flex flex-col h-full w-full px-6">
          <Text className="font-bold text-4xl text-white mt-8 mb-8 ml-4">
            Verify Account
          </Text>
          <View className="justify-center items-center px-3 mt-6">
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="Birthday"
              value={birthday}
              onChangeText={setBirthday}
            />
            <TextInput
              className="w-full bg-white text-lg p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholderTextColor="#888"
              placeholder="ID Number"
              value={idNumber}
              onChangeText={setIdNumber}
            />
            {/* ID Photo Upload Button */}
            <View className="w-full flex flex-row justify-between items-center bg-white mx-3 mb-4 rounded-lg">
              <Text className="text-lg font-bold text-[#888] p-3">
                Upload ID Photo
              </Text>
              <TouchableOpacity
                className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg"
                onPress={pickImage}
              >
                <Text className="text-white text-md font-normal">
                  Choose Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selfie with ID Button */}
            <View className="w-full flex flex-row justify-between items-center bg-white mx-3 mb-4 rounded-lg">
              <Text className="text-lg font-bold text-[#888] p-3">
                Take a Selfie with ID
              </Text>
              <TouchableOpacity
                className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg"
                onPress={takeSelfie}
              >
                <Text className="text-white text-md font-normal px-2">
                  Take Selfie
                </Text>
              </TouchableOpacity>
            </View>

            {/* Take Picture of ID Button */}
            <View className="w-full flex flex-row justify-between items-center bg-white mx-3 mb-4 rounded-lg">
              <Text className="text-lg font-bold text-[#888] p-3">
                Take a Picture of the ID
              </Text>
              <TouchableOpacity
                className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg"
                onPress={takeIdPicture}
              >
                <Text className="text-white text-md font-normal px-2">
                  Capture ID
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
              onPress={handleVerify}
            >
              <Text className="text-xl py-1 font-bold text-white">Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
              onPress={() => router.back()}
            >
              <Text className="text-xl py-1 font-bold text-white">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Modal for Verification */}
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="w-4/5 p-5 bg-white rounded-lg items-center border-2 border-[#0C3B2D]">
                <Text className="text-2xl font-semibold text-[#0C3B2D] mb-5">
                  Wait for Verification
                </Text>
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-lg font-semibold text-white px-2">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
