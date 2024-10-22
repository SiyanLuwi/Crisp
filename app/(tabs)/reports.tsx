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
import MapView, { Marker, Region } from "react-native-maps";
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
import * as Location from "expo-location";
const { height, width } = Dimensions.get("window");

const db = getFirestore(app);
const storage = getStorage();

interface Report {
  id: string;
  username: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  upvote: 0;
  downvote: 0;
  report_date: string;
}

const fetchDocuments = async () => {
  const categories = ['fires', 'floods', 'street lights', 'not related', 'road blockage'];
  const allReports: Report[] = [];

  for (const category of categories) {
    const querySnapshot = await getDocs(collection(db, `reports/${category}/reports`));
    const reports = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Report, "id">),
    }));
    allReports.push(...reports);
  }

  return allReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
};


export default function Reports() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region>(initialRegion);
  const [userLocation, setUserLocation] = useState<any>('');
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [username, setUsername] = useState<string | null>("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Report[], Error>({
    queryKey: ["reports"],
    queryFn: fetchDocuments,
    // Ensure you're using the correct types here
  });
  if (isLoading) return <Text>Loading..</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

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
            <Text className="pl-3 text-xl font-bold">{username}</Text>
            <Text className="pl-3 text-md font-bold text-slate-500">
              {formattedDate} {"\n"}
              <Text className="text-md font-normal text-slate-500">{formattedTime}</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedReport(item);
            setReportModalVisible(true);
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
        {item.image_path && (
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
        )}
        <View className="w-full flex flex-row mt-2 justify-between">
          <View className="flex flex-row items-center">
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons
                name="thumb-up-outline"
                size={width * 0.06}
                color="#0C3B2D"
              />
            </TouchableOpacity>
            <Text className="text-lg mx-1">{item.downvote}</Text>
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons
                name="thumb-down-outline"
                size={width * 0.06}
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
                size={width * 0.06}
                color="#0C3B2D"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bgImage.png")}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 justify-start items-center mb-10">
      <MapView
        style={{ width, height: height * 0.4 }}
        region={userLocation ? region : initialRegion} // This ensures it's never null
        onRegionChangeComplete={setRegion} 
        >
          {data.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.type_of_report}
              description={item.report_description}
            />
          ))}
        </MapView>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        />
      </SafeAreaView>
      <Modal visible={fullImageModalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setFullImageModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="h-full w-full"
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ReportReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </ImageBackground>
  );
}
