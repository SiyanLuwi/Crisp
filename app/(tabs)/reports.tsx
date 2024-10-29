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
import ReportReportModal from "@/components/reportReport";
const bgImage = require("@/assets/images/bgImage.png");
import { router } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { useAuth } from "@/AuthContext/AuthContext";
const { height, width } = Dimensions.get("window");
import { Vote } from "../utils/voteCounts";
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
  upvoteCount: number | any,
  downvoteCount: number | any,
  voted: 'upvote' | 'downvote' | null
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
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState<number>(0);
  const [downvoteCount, setDownvoteCount] = useState<number>(0);
  const [voted, setVoted] = useState<"upvote" | "downvote" | null>(null);
  const { USER_ID } = useAuth()

  async function fetchAllVotes() {
    const AllVotes: any[] = [];
    try {
      const allVotes = await Vote.getAllVotes(); 
      
      allVotes.forEach((report) => {
        report.votes.forEach((vote) => {
          AllVotes.push({reportId: report.reportId, userId: vote.user_id, vote: vote.vote });
        });
      });
      return AllVotes;
    } catch (error) {
      console.error("Error fetching all votes:", error);
    }
  }
  const fetchAllDocuments = async (userId: string, votes: any[]) => {
    const categories = [
        "fires",
        "street light",
        "potholes",
        "floods",
        "others",
        "road incidents",
    ];
    const unsubscribeFunctions = categories.map((category) => {
        return onSnapshot(
            collection(db, `reports/${category}/reports`),
            async (snapshot) => {
                const reports: Report[] = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const data = doc.data() as Omit<Report, "id">; 
                        const reportId = doc.id;
                        const reportVotes = votes?.filter(vote => vote.reportId === reportId);
                        const upvotes = reportVotes?.filter(vote => vote.vote === 'upvote').length;
                        const downvotes = reportVotes?.filter(vote => vote.vote === 'downvote').length;
                        const userVote = reportVotes?.find(vote => vote.userId === userId);
                        const voted = userVote ? userVote.vote : null;
                        return {
                            id: reportId,
                            ...data,
                            upvoteCount: upvotes,
                            downvoteCount: downvotes,
                            voted: voted
                        };
                    })
                );

                const sortedReports = reports.sort((a, b) => {
                    return new Date(b.report_date).getTime() - new Date(a.report_date).getTime();
                });

                setReports((prevReports) => {
                    const existingReports = prevReports.filter((report) => report.category !== category);
                    const newReports = [...existingReports, ...sortedReports];

                    // Compare newReports with prevReports
                    if (JSON.stringify(prevReports) !== JSON.stringify(newReports)) {
                        return newReports; // Update state only if reports have changed
                    }
                    return prevReports; // Return previous state if no change
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
      if(!USER_ID){
        throw new Error("Cannot fetch USER_ID!")
      }
      const votes = await fetchAllVotes()
      if(!votes){
        console.error("Votes is undefined");
        return; // Early return instead of throwing an error
      }
      const unsubscribe = await fetchAllDocuments(USER_ID, votes); // Await the Promise
      return unsubscribe; // Return the unsubscribe function for cleanup
    };
    fetchData().catch((error) => {
      console.error("Error in fetching documents:", error);
    });
  }, []);


  const loadReports = async () => {
    setRefreshing(true); // Start refreshing
    if (!USER_ID) {
        console.error("Cannot fetch USER_ID!");
        setRefreshing(false);
        return; // Early return
    }

    const votes = await fetchAllVotes();
    if (!votes) {
        console.error("Votes is undefined");
        setRefreshing(false);
        return; // Early return
    }
    setReports([]); 
    await fetchAllDocuments(USER_ID, votes); // Fetch the reports 
    setRefreshing(false); // Stop refreshing
};


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


  const handleUpvote = async (reportId: string, category: string) => {
    try {
      const reportRef = doc(db, `reports/${category.toLowerCase()}/reports/${reportId}/votes/${USER_ID}`);   
      console.log("Document Reference:", reportRef.path);
      const reportSnap = await getDoc(reportRef);
      const data = {
        user_id: USER_ID,
        vote: 'upvote'
      };
      
      if (reportSnap.exists()) {
        const existingVote = reportSnap.data().vote;
        if(existingVote === 'upvote'){
            await deleteDoc(reportRef)
            console.log("Remove upvote!")
        }else{
          await deleteDoc(reportRef)
          await setDoc(reportRef, data)
          console.log("Update Vote!")
        }
      } else {
        await setDoc(reportRef, data);
        console.log("Upvote added successfully!", reportId);
      }
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };
  

  const handleDownvote = async (reportId: string, category: string) => {
    try {
      const reportRef = doc(db, `reports/${category.toLowerCase()}/reports/${reportId}/votes/${USER_ID}`);   
      console.log("Document Reference:", reportRef.path);
      const reportSnap = await getDoc(reportRef);
      const data = {
        user_id: USER_ID,
        vote: 'downvote'
      };
      
      if (reportSnap.exists()) {
        const existingVote = reportSnap.data().vote;

        if(existingVote === 'downvote'){
            await deleteDoc(reportRef)
            console.log("Remove downvote!")
        }else{
          await deleteDoc(reportRef)
          await setDoc(reportRef, data)
          console.log("Update Vote!")
        }
      } else {
        await setDoc(reportRef, data);
        console.log("Upvote added successfully!", reportId);
      }
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

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
        <View className="w-full flex flex-row mt-2 justify-between">
          <View className="flex flex-row items-center">
            <TouchableOpacity
              onPress={() => handleUpvote(item.id, item.type_of_report)}
            >
              <MaterialCommunityIcons
                name={item.voted === "upvote" ? "thumb-up" : "thumb-up-outline"}
                size={width * 0.06}
                color="#0C3B2D"
                paddingHorizontal={10}
              />
            </TouchableOpacity>
            <Text className="text-lg mx-1">{item.upvoteCount}</Text>
            <TouchableOpacity
              onPress={() => handleDownvote(item.id, item.type_of_report)}
            >
              <MaterialCommunityIcons
                name={
                  item.voted === "downvote"
                    ? "thumb-down"
                    : "thumb-down-outline"
                }
                size={width * 0.06}
                color="#0C3B2D"
                paddingHorizontal={10}
              />
            </TouchableOpacity>
            <Text className="text-lg mx-1">{item.downvoteCount}</Text>
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
        />
        <ReportReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
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
                        latitude: selectedReport.longitude,
                        longitude: selectedReport.latitude,
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
                          latitude: selectedReport.longitude,
                          longitude: selectedReport.latitude,
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
        <TouchableOpacity className="p-2">
          <MaterialCommunityIcons
            name="thumb-down-outline"
            size={width * 0.15} // Responsive icon size
            color="#0C3B2D"
          />
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}
