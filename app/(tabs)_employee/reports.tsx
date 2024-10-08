import React, { useState } from "react";
import {
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
import FeedbackModal from "@/components/feedback";
const bgImage = require("@/assets/images/bgImage.png");
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");

const posts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  imageUri: "https://via.placeholder.com/150",
  location: `Image Location ${index + 1}`,
  type: `Image Type ${index + 1}`,
  description: `Image Description ${index + 1}`,
}));

export default function Reports() {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

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
          data={posts}
          keyExtractor={(item) => item.id}
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
                  <Text className="pl-3 text-xl font-bold">John Doe</Text>
                  <Text className="pl-3 text-md font-bold text-slate-500">
                    12:51
                  </Text>
                </View>
              </View>
              <View className="w-full flex flex-row mt-2">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Location:
                </Text>
                <Text className="text-lg text-left">{item.location}</Text>
              </View>
              <View className="w-full flex flex-row">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Type of Report:
                </Text>
                <Text className="text-lg text-left">{item.type}</Text>
              </View>
              <View className="w-full flex flex-row">
                <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                  Description:
                </Text>
                <Text className="text-lg text-left flex-1">
                  {item.description}
                </Text>
              </View>
              <Image
                source={{ uri: item.imageUri }}
                className="w-full h-72 rounded-lg my-1 border border-[#0C3B2D]"
              />
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
                  <Text className="text-md font-extrabold text-white px-5">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)} // Hide modal
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
