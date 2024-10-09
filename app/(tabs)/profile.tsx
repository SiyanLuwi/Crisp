import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LogoutModal from "@/components/logout";
import ChangePasswordModal from "@/components/changePassword";
import SaveConfirmationModal from "@/components/saveConfirmModal";
import CancelModal from "@/components/cancelModal";
import { router } from "expo-router";
const bgImage = require("@/assets/images/bgImage.png");

const { width, height } = Dimensions.get("window");
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { citizenProfile } from "../api/apiService";

const queryClient = new QueryClient();

export default function Profile() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

function App() {
  const { data } = useQuery({ queryKey: ["groups"], queryFn: citizenProfile });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const [name, setName] = useState(data?.username || "");
  const [address, setAddress] = useState(data?.address || "");
  const [email, setEmail] = useState(data?.email || "");
  const [contact, setContact] = useState(data?.contact_number || "");

  // State to hold previous values
  const [prevValues, setPrevValues] = useState({
    name,
    address,
    email,
    contact,
  });

  const handleLogout = () => {
    console.log("User logged out");
    setLogoutModalVisible(false);
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("Change password:", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setTimeout(() => {
        if (newPassword === confirmPassword && newPassword.length > 0) {
          console.log("Password changed successfully!");
          resolve();
        } else {
          reject(new Error("Passwords do not match or are invalid."));
        }
      }, 2000);
    });
  };

  const toggleEdit = () => {
    if (isEditing) {
      setShowSaveConfirmation(true); // Show confirmation when trying to save
    }
    setIsEditing(!isEditing);
  };

  const confirmCancel = () => {
    cancelSave(); // Call the function to revert changes
    setCancelModalVisible(false);
    router.push("/(tabs)/profile");
  };

  const confirmSave = () => {
    console.log("Saved changes:", { name, address, email, contact });
    setPrevValues({ name, address, email, contact }); // Update previous values
    setShowSaveConfirmation(false);
    setIsEditing(false);
  };

  const cancelSave = () => {
    // Revert to previous values
    setName(prevValues.name);
    setAddress(prevValues.address);
    setEmail(prevValues.email);
    setContact(prevValues.contact);
    setShowSaveConfirmation(false);
    setIsEditing(false); // Exit edit mode
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="w-full h-full flex-1 justify-start items-center absolute bg-[#0C3B2D] pt-9">
        <View className="flex flex-row h-auto w-full items-center justify-between px-6">
          <Text className="font-bold text-4xl text-white mt-3 mb-2">
            Account
          </Text>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
            <MaterialCommunityIcons
              name="logout"
              size={RFPercentage(4)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <ScrollView className="w-full h-full flex">
          <View className="flex flex-col w-full h-full items-center ">
            <Image
              source={{ uri: "https://via.placeholder.com/150" }}
              className="w-48 h-48 rounded-full border-4 border-white mb-8 mt-8"
            />
            <View className="justify-center w-full items-center px-12 mt-6">
              <TextInput
                className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={name}
                editable={isEditing}
                onChangeText={setName}
                placeholderTextColor="#888"
                placeholder="Name"
              />
              <TextInput
                className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={address}
                editable={isEditing}
                onChangeText={setAddress}
                placeholderTextColor="#888"
                placeholder="Address"
              />
              <TextInput
                className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={email}
                editable={isEditing}
                onChangeText={setEmail}
                placeholderTextColor="#888"
                placeholder="Email Address"
              />
              <TextInput
                className="w-full bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={contact}
                editable={isEditing}
                onChangeText={setContact}
                placeholderTextColor="#888"
                placeholder="Phone Number"
              />
              <View className="w-full flex flex-row justify-between items-center bg-white mx-3 mb-4 rounded-lg">
                <Text className="text-md p-4 font-bold text-[#888]">
                  Not Yet Verified
                </Text>
                <TouchableOpacity
                  className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg"
                  onPress={() => router.push("/pages/verifyPage")}
                >
                  <Text className="text-white text-md font-normal">Verify</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
                onPress={toggleEdit}
              >
                <Text className="text-xl py-1 font-bold text-white">
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
              {isEditing && (
                <TouchableOpacity
                  className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                  onPress={() => setCancelModalVisible(true)}
                >
                  <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              {!isEditing && (
                <TouchableOpacity
                  className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                  onPress={() => setChangePasswordModalVisible(true)}
                >
                  <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                    Change Password
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Logout Confirmation Modal */}
          <LogoutModal
            visible={logoutModalVisible}
            onConfirm={handleLogout}
            onCancel={() => setLogoutModalVisible(false)}
          />

          {/* Change Password Modal */}
          <ChangePasswordModal
            visible={changePasswordModalVisible}
            onConfirm={handleChangePassword}
            onCancel={() => setChangePasswordModalVisible(false)}
          />

          {/* Save Confirmation Modal */}
          <SaveConfirmationModal
            visible={showSaveConfirmation}
            onConfirm={confirmSave}
            onCancel={cancelSave}
          />

          {/* Cancel Modal */}
          <CancelModal
            visible={cancelModalVisible}
            onConfirm={confirmCancel}
            onCancel={() => setCancelModalVisible(false)}
          />

          <View className="flex flex-row items-center">
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons
                name="format-align-justify"
                size={width * 0.2} // Responsive icon size
                color="#0C3B2D"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
