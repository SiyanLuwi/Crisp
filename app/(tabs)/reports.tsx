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
  arrayUnion,
  increment,
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
  custom_type: string;
  floor_number: string;
  upvoteCount: number | any;
  downvoteCount: number | any;
  voted: "upvote" | "downvote" | null;
  is_validated: boolean;
}
interface Location {
  latitude: number;
  longitude: number;
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { USER_ID } = useAuth();
  const { getUserInfo } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [visibleReportsCount, setVisibleReportsCount] = useState(5);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await (getUserInfo
        ? getUserInfo()
        : Promise.resolve({}));
      setIsVerified(userInfo?.is_verified || "");
    };

    loadUserInfo();
  }, [getUserInfo]);

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
              const reportVotes = votes?.filter(
                (vote) => vote.reportId === reportId
              );
              const upvotes = reportVotes?.filter(
                (vote) => vote.vote === "upvote"
              ).length;
              const downvotes = reportVotes?.filter(
                (vote) => vote.vote === "downvote"
              ).length;
              const userVote = reportVotes?.find(
                (vote) => vote.userId === userId
              );
              const voted = userVote ? userVote.vote : null;
              return {
                id: reportId,
                ...data,
                upvoteCount: upvotes,
                downvoteCount: downvotes,
                voted: voted,
              };
            })
          );

          // Filter for reports that are validated
          const validatedReports = reports.filter(
            (report) => report.is_validated
          );

          setReports((prevReports) => {
            // Combine previous reports with new ones
            const combinedReports = [...prevReports, ...reports];
            // const combinedReports = [...prevReports, ...validatedReports];

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

  const handleReportSubmit = async (
    reportId: string,
    category: string,
    reason: string
  ) => {
    try {
      const reportRef = doc(
        db,
        `reports/${category.toLowerCase()}/reports/${reportId}/reported/reasons`
      );
      await setDoc(
        reportRef,
        {
          report_count: increment(1),
          report_reason: arrayUnion(reason),
          reported_date: arrayUnion(new Date().toISOString()),
          reported_by: arrayUnion(USER_ID),
        },
        { merge: true }
      );

      // Fetch and log the document to confirm
      const docSnap = await getDoc(reportRef);
      if (docSnap.exists()) {
        console.log("Document data after submit:", docSnap.data());
      } else {
        console.log("No such document!");
      }

      console.log("Report submitted successfully");
    } catch (error) {
      console.error("Error reporting the post:", error);
    }
  };

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

  const loadMoreReports = () => {
    setVisibleReportsCount((prevCount) => prevCount + 5); // Increment the count by 5
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

  const handleUpvote = async (reportId: string, category: string) => {
    try {
      const reportRef = doc(
        db,
        `reports/${category.toLowerCase()}/reports/${reportId}/votes/${USER_ID}`
      );
      console.log("Document Reference:", reportRef.path);
      const reportSnap = await getDoc(reportRef);
      const data = {
        user_id: USER_ID,
        vote: "upvote",
      };

      if (reportSnap.exists()) {
        const existingVote = reportSnap.data().vote;
        if (existingVote === "upvote") {
          await deleteDoc(reportRef);
          console.log("Remove upvote!");
        } else {
          await deleteDoc(reportRef);
          await setDoc(reportRef, data);
          console.log("Update Vote!");
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
      const reportRef = doc(
        db,
        `reports/${category.toLowerCase()}/reports/${reportId}/votes/${USER_ID}`
      );
      console.log("Document Reference:", reportRef.path);
      const reportSnap = await getDoc(reportRef);
      const data = {
        user_id: USER_ID,
        vote: "downvote",
      };

      if (reportSnap.exists()) {
        const existingVote = reportSnap.data().vote;

        if (existingVote === "downvote") {
          await deleteDoc(reportRef);
          console.log("Remove downvote!");
        } else {
          await deleteDoc(reportRef);
          await setDoc(reportRef, data);
          console.log("Update Vote!");
        }
      } else {
        await setDoc(reportRef, data);
        console.log("Upvote added successfully!", reportId);
      }
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  const handleReportValidate = async (reportId: string, category: string) => {
    try {
      const reportRef = doc(
        db,
        `reports/${category.toLowerCase()}/reports/${reportId}/validation/${USER_ID}`
      );
      const data = {
        user_id: USER_ID,
        validated: "validated",
      };

      await setDoc(reportRef, data);
      console.log("Report validated successfully!", reportId);

      setIsSuccess(true); // Set success state
      // Optionally, you might want to close the modal here after a short delay
    } catch (error) {
      console.error("Error handling validation:", error);
    }
  };

  const confirmValidation = async () => {
    if (selectedReport) {
      await handleReportValidate(
        selectedReport.id,
        selectedReport.type_of_report
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
            // console.log(item);
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
              {item.custom_type && item.custom_type.length > 0 && (
                <Text className="text-lg font-normal text-black ml-2">
                  {", " + item.custom_type}
                </Text>
              )}
            </Text>
          </Text>
        </View>
        {item.floor_number ? (
          <View className="w-full flex flex-row">
            <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
              Floor Number:
              <Text className="text-lg font-normal text-black ml-2">
                {" " + item.floor_number}
              </Text>
            </Text>
          </View>
        ) : null}
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
          {item.is_validated ? (
            <>
              <View className="flex flex-row items-center">
                <TouchableOpacity
                  onPress={() => handleUpvote(item.id, item.type_of_report)}
                  disabled={!isVerified}
                >
                  <MaterialCommunityIcons
                    name={
                      item.voted === "upvote" ? "thumb-up" : "thumb-up-outline"
                    }
                    size={width * 0.06}
                    color={isVerified ? "#0C3B2D" : "#A0A0A0"}
                    paddingHorizontal={10}
                  />
                </TouchableOpacity>
                <Text className="text-lg mx-1">{item.upvoteCount}</Text>
                <TouchableOpacity
                  onPress={() => handleDownvote(item.id, item.type_of_report)}
                  disabled={!isVerified}
                >
                  <MaterialCommunityIcons
                    name={
                      item.voted === "downvote"
                        ? "thumb-down"
                        : "thumb-down-outline"
                    }
                    size={width * 0.06}
                    color={isVerified ? "#0C3B2D" : "#A0A0A0"}
                    paddingHorizontal={10}
                  />
                </TouchableOpacity>
                <Text className="text-lg mx-1">{item.downvoteCount}</Text>
              </View>
              <View className="flex flex-row items-center">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => {
                    setSelectedReport(item); // Ensure the selected report is set
                    setReportModalVisible(true); // Then open the report modal
                  }}
                  disabled={!isVerified}
                >
                  <MaterialCommunityIcons
                    name="format-align-justify"
                    size={width * 0.06}
                    color={isVerified ? "#0C3B2D" : "#A0A0A0"}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View className="w-full flex flex-row">
              <View className="flex-1 mr-3">
                <TouchableOpacity
                  className={`bg-[#0C3B2D] border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ${
                    !isVerified ? "opacity-50" : ""
                  }`}
                  // onPress={onValidate} handleReportValidate
                  onPress={() => {
                    setSelectedReport(item); // Set the selected report
                    setIsModalVisible(true); // Show the modal
                    setIsSuccess(false); // Reset success state
                  }}
                  disabled={!isVerified}
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Validate Report
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <TouchableOpacity
                  className={`bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ${
                    !isVerified ? "opacity-50" : ""
                  }`}
                  onPress={() => {
                    setSelectedReport(item); // Ensure the selected report is set
                    setReportModalVisible(true); // Then open the report modal
                  }}
                  disabled={!isVerified}
                >
                  <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                    Report Incident
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/pages/notification" })}
          >
            <MaterialCommunityIcons
              name="bell"
              size={RFPercentage(3.5)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={reports.slice(0, visibleReportsCount)}
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
          onEndReached={loadMoreReports} // Load more reports when reaching the end
          onEndReachedThreshold={0.0}
          ListFooterComponent={
            visibleReportsCount >= reports.length ? ( // Check if we've displayed all reports
              <Text
                style={{ padding: 20, color: "white", textAlign: "center" }}
              >
                You've reached the end of the page.
              </Text>
            ) : null
          }
        />

        <ReportReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          onConfirmReport={(reason) => {
            if (selectedReport) {
              handleReportSubmit(
                selectedReport.id,
                selectedReport.type_of_report,
                reason
              );
            } else {
              console.error("No report selected");
            }
          }}
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

        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="w-4/5 p-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                {isSuccess ? (
                  <>
                    <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                      Report validation successful!
                    </Text>
                    <View className="flex flex-row justify-end mt-3 w-full">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                        onPress={() => setIsModalVisible(false)} // Close the modal here
                      >
                        <Text className="text-md font-semibold text-white px-4">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                      Confirm Report Validation
                    </Text>
                    <View className="flex flex-row justify-end mt-3 w-full">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                        onPress={confirmValidation} // Confirm validation
                      >
                        <Text className="text-md font-semibold text-white px-4">
                          Confirm
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
                        onPress={() => setIsModalVisible(false)} // Close modal
                      >
                        <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
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
