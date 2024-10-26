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
  voted: "upvote" | "downvote" | null; // Add voted property
  upvoteCount: number; // Add upvoteCount
  downvoteCount: number; // Add downvoteCount
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

  const fetchAllDocuments = async () => {
    const categories = [
      "fires",
      "street lights",
      "potholes",
      "floods",
      "others",
      "road incidents",
    ];

    // Use an array to store unsubscribe functions
    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        async (snapshot) => {
          const reports: Report[] = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data() as Omit<Report, "id">; // Omit the id when fetching data
              const reportId = doc.id; // Store report ID to check vote status
              const voted = await getVoteStatus(reportId); // Check if the user has voted

              return {
                id: reportId,
                username: data.username || "",
                type_of_report: data.type_of_report || "",
                report_description: data.report_description || "",
                longitude: data.longitude || 0,
                latitude: data.latitude || 0,
                category: category,
                image_path: data.image_path || "",
                upvote: data.upvote || 0,
                downvote: data.downvote || 0,
                report_date: data.report_date || "",
                voted: voted, // Set the voted state based on retrieval
                upvoteCount: data.upvote || 0,
                downvoteCount: data.downvote || 0,
              };
            })
          );

          const sortedReports = reports.sort((a, b) => {
            const dateA = new Date(a.report_date).getTime();
            const dateB = new Date(b.report_date).getTime();
            return dateB - dateA;
          });

          setReports((prevReports) => {
            const existingReports = prevReports.filter(
              (report) => report.category !== category
            );
            return [...existingReports, ...sortedReports];
          });
        },
        (error) => {
          console.error(`Error fetching reports from ${category}:`, error);
        }
      );
    });

    // Return a cleanup function that unsubscribes all listeners
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = await fetchAllDocuments(); // Await the Promise
      return unsubscribe; // Return the unsubscribe function for cleanup
    };

    fetchData().catch((error) => {
      console.error("Error in fetching documents:", error);
    });

    // Cleanup function returned from the inner async function
    return () => {
      // Handle cleanup if necessary, for example if unsubscribe is defined correctly
    };
  }, []);

  const updateVoteCount = async (
    reportId: string,
    upvoteCount: number,
    downvoteCount: number,
    category: string // Add category as a parameter
  ) => {
    const reportRef = doc(db, `reports/${category}/reports`, reportId); // Use the passed category

    await updateDoc(reportRef, {
      upvote: upvoteCount,
      downvote: downvoteCount,
    }).catch((error) => {
      console.error("Error updating vote counts:", error);
    });
    // console.log("Vote counts updated successfully");
  };

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

  // Function to save vote status in SecureStore
  const saveVoteStatus = async (
    reportId: string,
    voteType: "upvote" | "downvote"
  ) => {
    try {
      await SecureStore.setItemAsync(reportId, voteType);
    } catch (error) {
      console.error("Error saving vote status:", error);
    }
  };

  // Function to retrieve vote status from SecureStore
  const getVoteStatus = async (
    reportId: string
  ): Promise<"upvote" | "downvote" | null> => {
    try {
      return (await SecureStore.getItemAsync(reportId)) as
        | "upvote"
        | "downvote"
        | null;
    } catch (error) {
      console.error("Error retrieving vote status:", error);
      return null;
    }
  };

  const handleUpvote = async (reportId: string, category: string) => {
    const existingVote = await getVoteStatus(reportId);
    if (!existingVote || existingVote === "downvote") {
      setReports((prevReports) =>
        prevReports.map((report) => {
          if (report.id === reportId) {
            // Compute new counts
            const newUpvoteCount = report.upvoteCount + 1;
            const newDownvoteCount =
              report.voted === "downvote"
                ? report.downvoteCount - 1
                : report.downvoteCount;

            // Update Firestore and save vote status
            updateVoteCount(
              reportId,
              newUpvoteCount,
              newDownvoteCount,
              category
            );
            saveVoteStatus(reportId, "upvote");

            return {
              ...report,
              upvoteCount: newUpvoteCount,
              downvoteCount: newDownvoteCount,
              voted: "upvote",
            };
          }
          return report;
        })
      );
    }
  };

  const handleDownvote = async (reportId: string, category: string) => {
    const existingVote = await getVoteStatus(reportId);
    if (!existingVote || existingVote === "upvote") {
      setReports((prevReports) =>
        prevReports.map((report) => {
          if (report.id === reportId) {
            // Compute new counts
            const newDownvoteCount = report.downvoteCount + 1;
            const newUpvoteCount =
              report.voted === "upvote"
                ? report.upvoteCount - 1
                : report.upvoteCount;

            // Update Firestore and save vote status
            updateVoteCount(
              reportId,
              newUpvoteCount,
              newDownvoteCount,
              category
            );
            saveVoteStatus(reportId, "downvote");

            return {
              ...report,
              upvoteCount: newUpvoteCount,
              downvoteCount: newDownvoteCount,
              voted: "downvote",
            };
          }
          return report;
        })
      );
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
              onPress={() => handleUpvote(item.id, item.category)}
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
              onPress={() => handleDownvote(item.id, item.category)}
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
