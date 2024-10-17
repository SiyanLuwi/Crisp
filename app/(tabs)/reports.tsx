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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import ReportReportModal from "@/components/reportReport";
const bgImage = require("@/assets/images/bgImage.png");
import { router } from "expo-router";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useQuery } from "@tanstack/react-query";
import { app } from "@/firebase/firebaseConfig";
import * as SecureStore from "expo-secure-store";
const { height, width } = Dimensions.get("window");

const db = getFirestore(app);
const storage = getStorage();

interface Report {
  id: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  upvote: 0;
  downvote: 0;
}

const fetchDocuments = async () => {
  const querySnapshot = await getDocs(collection(db, "reports"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Report, "id">),
  }));
};

export default function Reports() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [username, setUsername] = useState<string | null>("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { data, isLoading, error } = useQuery<Report[], Error>({
    queryKey: ["reports"],
    queryFn: fetchDocuments,
  });
  const fetchUsername = async () => {
    const username = await SecureStore.getItemAsync("username");
    setUsername(username);
  };
  useEffect(() => {
    fetchUsername();
  }, []);
  if (isLoading) return <Text>Loading..</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
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
          data={data}
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
                  <Text className="pl-3 text-xl font-bold">{username}</Text>
                  <Text className="pl-3 text-md font-bold text-slate-500">
                    12:51
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
              <View className="w-full flex flex-row mt-2 justify-between">
                <View className="flex flex-row items-center">
                  <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons
                      name="thumb-up-outline"
                      size={width * 0.06} // Responsive icon size
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                  <Text className="text-lg mx-1">{item.downvote}</Text>
                  <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons
                      name="thumb-down-outline"
                      size={width * 0.06} // Responsive icon size
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                  <Text className="text-lg mx-1">{item.upvote}</Text>
                </View>
                <View className="flex flex-row items-center">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => setReportModalVisible(true)}
                  >
                    <MaterialCommunityIcons
                      name="format-align-justify"
                      size={width * 0.06} // make modal here
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

        <ReportReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)} // Hide modal
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
                    width: width * 0.9, // 90% of screen width
                    height: height * 0.55, // 60% of screen height
                    borderRadius: 10,
                  }}
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
                    backgroundColor: "white", // Optional: background for modal content
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
                        latitude: selectedReport.longitude, // Corrected to latitude
                        longitude: selectedReport.latitude, // Corrected to longitude
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: selectedReport.longitude, // Corrected to latitude
                          longitude: selectedReport.latitude, // Corrected to longitude
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
      </SafeAreaView>
    </ImageBackground>
  );
}
