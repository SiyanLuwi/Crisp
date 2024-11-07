import React, { useEffect, useState } from "react";
import {
  StyleSheet,
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
import { router } from "expo-router";
import DeleteReportModal from "@/components/deleteReport";
import FeedbackModal from "@/components/userFeedback";
const bgImage = require("@/assets/images/bgImage.png");
import { app } from "@/firebase/firebaseConfig";
import { useAuth } from "@/AuthContext/AuthContext";
import { Vote } from "../utils/voteCounts";
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { Report, Reports } from "../utils/reports";

const db = getFirestore(app);
const { height, width } = Dimensions.get("window");

const posts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  imageUri: "https://via.placeholder.com/150",
  location: `Image Location ${index + 1}`,
  type: `Image Type ${index + 1}`,
  description: `Image Description ${index + 1}`,
}));

interface Location {
  latitude: number;
  longitude: number;
}
export default function ManageReports() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { USER_ID } = useAuth();

  async function fetchAllVotes() {
    const AllVotes: any[] = [];
    try {
      const allVotes = await Vote.getAllVotes();

      allVotes.forEach((report) => {
        report.votes.forEach((vote) => {
          AllVotes.push({
            reportId: report.reportId,
            userId: vote.user_id,
            vote: vote.vote,
          });
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
      "road accident",
    ];

    // Retrieve the user ID securely
    const users_id = await SecureStore.getItemAsync("user_id");

    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        async (snapshot) => {
          const reports: (Reports | null)[] = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data() as Omit<Report, "id">;
              const reportId = doc.id;
              const reportVotes = votes?.filter(
                (vote) => vote.reportId === reportId
              );
              const upvotes =
                reportVotes?.filter((vote) => vote.vote === "upvote").length ||
                0;
              const downvotes =
                reportVotes?.filter((vote) => vote.vote === "downvote")
                  .length || 0;
              const userVote = reportVotes?.find(
                (vote) => vote.userId === userId
              );
              const voted = userVote ? userVote.vote : null;

              // Fetch user and worker feedback
              const userFeedbackRef = collection(
                db,
                `reports/${category}/reports/${reportId}/userFeedback`
              );
              const workerFeedbackRef = collection(
                db,
                `reports/${category}/reports/${reportId}/workerFeedback`
              );

              const userFeedbackSnapshot = await getDocs(userFeedbackRef);
              const workerFeedbackSnapshot = await getDocs(workerFeedbackRef);

              const userFeedbackDescriptions = userFeedbackSnapshot.docs.map(
                (doc) => doc.data().description
              );
              const workerFeedbackDescriptions =
                workerFeedbackSnapshot.docs.map(
                  (doc) => doc.data().description
                );

              // Only return the report if the user ID matches
              if (data.user_id?.toString() === users_id?.toString()) {
                return {
                  id: reportId,
                  ...data,
                  upvoteCount: upvotes,
                  downvoteCount: downvotes,
                  voted: voted,
                  userFeedback: userFeedbackDescriptions, // Add user feedback
                  workerFeedback: workerFeedbackDescriptions, // Add worker feedback
                };
              }
              return null; // Exclude reports that don't match user_id
            })
          );

          // Filter out null values before updating the state
          const filteredReports: Reports[] = reports.filter(
            (report): report is Reports => report !== null
          );

          setReports((prevReports) => {
            // Combine previous reports with new ones
            const combinedReports = [...prevReports, ...filteredReports];

            // Sort all reports by date
            const sortedReports = combinedReports.sort((a, b) => {
              return (
                new Date(b.report_date).getTime() -
                new Date(a.report_date).getTime()
              );
            });

            // Return sorted reports only if they have changed
            if (JSON.stringify(prevReports) !== JSON.stringify(sortedReports)) {
              return sortedReports;
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
      if (!USER_ID) {
        throw new Error("Cannot fetch USER_ID!");
      }
      const votes = await fetchAllVotes();
      if (!votes) {
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
      // console.log("Location permission status:", status);

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

  const haversineDistance = (
    userLocation: Location,
    selectedReport: Report
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const lat1 = toRad(userLocation.latitude);
    const lon1 = toRad(userLocation.longitude);
    const lat2 = toRad(selectedReport.latitude);
    const lon2 = toRad(selectedReport.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371000; // Earth's radius in meters
    return radius * c; // Distance in meters
  };

  // Fetch username when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await SecureStore.getItemAsync("username");
      setUsername(storedUsername);
    };

    fetchUsername().catch((error) => {
      console.error("Error fetching username:", error);
    });
  }, []);

  const handleDeleteReport = async (reportId: string) => {
    if (!selectedReport) return;

    try {
      const reportRef = doc(
        db,
        `reports/${selectedReport.type_of_report.toLowerCase()}/reports`,
        reportId
      );

      // Get the report data before deleting
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        console.error("Report does not exist!");
        return;
      }
      const reportData = reportSnap.data();

      // Delete all documents in the sub-collections: validation, votes, reasons, and feedback
      await deleteCollectionDocuments(
        reportId,
        selectedReport.type_of_report.toLowerCase()
      );

      const localDate = new Date();
      const localOffset = localDate.getTimezoneOffset() * 60000;
      const localTimeAdjusted = new Date(localDate.getTime() - localOffset);

      const localDateISOString = localTimeAdjusted.toISOString().slice(0, -1);

      // Move report to deletedReports with the correct local time
      const deletedReportRef = doc(db, "deletedReports", reportId);
      await setDoc(deletedReportRef, {
        ...reportData,
        deleted_at: localDateISOString,
        deleted_by: username, // assuming `username` is already defined elsewhere
      });

      // Delete the main report document
      await deleteDoc(reportRef);

      // Update the local state
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== reportId)
      );
      setSelectedReport(null); // Reset selected report
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // Function to delete all documents in a collection (sub-collections of the report)
  async function deleteCollectionDocuments(
    reportId: string,
    reportType: string
  ) {
    try {
      // Define the paths to the sub-collections
      const validationPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/validation`;
      const votesPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/votes`;
      const reasonsPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/reported/`;
      const userFeedbackPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/userFeedback`;
      const workerFeedbackPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/workerFeedback`;

      // Delete documents in validation collection
      await deleteSubCollectionDocuments(validationPath);
      await deleteSubCollectionDocuments(votesPath);
      await deleteSubCollectionDocuments(reasonsPath);
      await deleteSubCollectionDocuments(userFeedbackPath);
      await deleteSubCollectionDocuments(workerFeedbackPath);
    } catch (error) {
      console.error("Error deleting documents in sub-collections:", error);
    }
  }

  // Function to delete all documents in a given collection
  async function deleteSubCollectionDocuments(collectionPath: string) {
    try {
      const collectionRef = collection(db, collectionPath);
      const querySnapshot = await getDocs(collectionRef);

      // Loop through all documents in the collection and delete them
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
        console.log(
          `Document with ID ${docSnapshot.id} deleted from ${collectionPath}`
        );
      });
    } catch (error) {
      console.error(
        `Error deleting documents in collection ${collectionPath}:`,
        error
      );
    }
  }

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
            <MaterialCommunityIcons
              name="thumb-up-outline"
              size={width * 0.06}
              color={"#A0A0A0"}
              paddingHorizontal={10}
            />
            <Text className="text-lg mx-1">{item.upvoteCount}</Text>
            <MaterialCommunityIcons
              name="thumb-down-outline"
              size={width * 0.06}
              color={"#A0A0A0"}
              paddingHorizontal={10}
            />
            <Text className="text-lg mx-1">{item.downvoteCount}</Text>
          </View>
          <View className="flex flex-row items-center">
            {item.status === "pending_review" && (
              <TouchableOpacity
                className="bg-[#0C3B2D] p-2 rounded-md h-auto items-center justify-center"
                onPress={() => {
                  setFeedbackModalVisible(true);
                  setSelectedReport(item);
                }}
              >
                <MaterialCommunityIcons
                  name="check-decagram-outline"
                  size={width * 0.04}
                  color="white"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="p-2"
              onPress={() => {
                setSelectedReport(item); // Set the selected report
                setDeleteModalVisible(true); // Show the delete modal
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={width * 0.06}
                color="#0C3B2D"
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.status === "pending_review" && (
          <View className="w-full flex flex-col mt-2">
            <View className="w-full h-px bg-slate-300 mb-2" />
            <Text className="text-xl font-bold">Feedback:</Text>
            {item.workerFeedback?.map((feedback, index) => (
              <Text
                key={index}
                className="text-lg text-left pr-2 font-semibold text-slate-500"
              >
                Worker:
                <Text className="text-lg font-normal text-black ml-2">
                  {" " + feedback}
                  {/* You can replace this with any other data */}
                </Text>
              </Text>
            ))}
          </View>
        )}
        {item.status === "done" && (
          <View className="w-full flex flex-col mt-2">
            <View className="w-full h-px bg-slate-300 mb-2" />
            <Text className="text-xl font-bold">Feedback:</Text>
            {item.workerFeedback?.map((feedback, index) => (
              <Text
                key={index}
                className="text-lg text-left pr-2 font-semibold text-slate-500"
              >
                Worker:
                <Text className="text-lg font-normal text-black ml-2">
                  {" " + feedback}
                  {/* You can replace this with any other data */}
                </Text>
              </Text>
            ))}
          </View>
        )}
        {item.status === "done" && (
          <View className="w-full flex flex-col">
            {item.userFeedback?.map((feedback, index) => (
              <Text
                key={index}
                className="text-lg text-left pr-2 font-semibold text-slate-500"
              >
                {item.username}
                <Text className="text-lg font-normal text-black ml-2">
                  {" " + feedback}
                  {/* You can replace this with any other data */}
                </Text>
              </Text>
            ))}
          </View>
        )}
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
            Manage Reports
          </Text>
          <TouchableOpacity onPress={() => router.push("/pages/notification")}>
            <MaterialCommunityIcons
              name="bell"
              size={RFPercentage(3.5)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        {reports.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-slate-500">No reports yet</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item, index) => `${item.id}-${index}`}
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
        )}

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
          animationType="fade"
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
                    <>
                      <MapView
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 10,
                        }}
                        initialRegion={{
                          latitude: selectedReport.latitude,
                          longitude: selectedReport.longitude,
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
                            latitude: selectedReport.latitude,
                            longitude: selectedReport.longitude,
                          }}
                          title={selectedReport.type_of_report}
                        />
                      </MapView>
                      <Text style={{ padding: 10, color: "white" }}>
                        Distance from the Report:{" "}
                        {userLocation
                          ? (() => {
                              const distance = haversineDistance(
                                userLocation,
                                selectedReport
                              );
                              return distance > 1000
                                ? `${(distance / 1000).toFixed(2)} km` // Convert to kilometers
                                : `${distance.toFixed(2)} m`; // Keep in meters
                            })()
                          : "Calculating..."}
                      </Text>
                    </>
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

        <DeleteReportModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)} // Hide modal
          onConfirm={handleDeleteReport} // Pass the delete handler
          reportId={selectedReport?.id || null} // Pass the selected report's ID
        />
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)} // Hide modal
          reportId={selectedReport?.id || ""} // Pass the selected report ID
          category={selectedReport?.type_of_report || ""} // Pass the report category
          userId={USER_ID || ""} // Pass the USER_ID (this should be the actual user's ID)
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
