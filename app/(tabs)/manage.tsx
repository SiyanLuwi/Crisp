import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";
import DeleteReportModal from "@/components/deleteReport";
import FeedbackModal from "@/components/userFeedback";
import ImageModal from "@/components/imageModal";
import ReportLocationModal from "@/components/reportLocationModal";
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
import { Report, Reports } from "../utils/reports";

const db = getFirestore(app);
const { height, width } = Dimensions.get("window");

export default function ManageReports() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
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
                (doc) => ({
                  description: doc.data().description,
                  proof: doc.data().proof,
                  submited_at: doc.data().submited_at, // assuming 'submitted_at' is a Firestore timestamp
                })
              );
              const workerFeedbackDescriptions =
                workerFeedbackSnapshot.docs.map((doc) => ({
                  description: doc.data().description,
                  proof: doc.data().proof,
                  submited_at: doc.data().submited_at, // assuming 'submitted_at' is a Firestore timestamp
                }));

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

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
            {item.status === "reviewing" && (
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

        {item.status === "reviewing" && (
          <View className="w-full flex flex-col mt-2">
            <View className="w-full h-px bg-slate-300 mb-2" />
            <Text className="text-xl font-bold">Feedback:</Text>
            {item.workerFeedback?.map((feedback, index) => (
              <Text
                key={index}
                className="text-lg text-left pr-2 font-semibold text-slate-700"
              >
                Worker
                <Text className="text-sm font-semibold text-slate-500 ml-2 items-center">
                  {"   " + formatDate(feedback.submited_at)}
                </Text>
                <Text className="text-lg font-normal text-black ml-2">
                  {"\n" + feedback.description}
                </Text>
              </Text>
            ))}
          </View>
        )}
        {item.status === "done" && (
          <>
            <View className="w-full flex flex-col mt-2">
              <View className="w-full h-px bg-slate-300 mb-2" />
              <Text className="text-xl font-bold">Feedback:</Text>
              {item.workerFeedback?.map((feedback, index) => (
                <Text
                  key={index}
                  className="text-lg text-left pr-2 font-semibold text-slate-700"
                >
                  Worker
                  <Text className="text-sm font-semibold text-slate-500 ml-2 items-center">
                    {"   " + formatDate(feedback.submited_at)}
                  </Text>
                  <Text className="text-lg font-normal text-black ml-2">
                    {"\n" + feedback.description}
                  </Text>
                </Text>
              ))}
            </View>
            <View className="w-full flex flex-col">
              {item.userFeedback?.map((feedback, index) => (
                <Text
                  key={index}
                  className="text-lg text-left pr-2 font-semibold text-slate-700"
                >
                  {item.username}
                  <Text className="text-sm font-semibold text-slate-500 ml-2 items-center">
                    {"   " + formatDate(feedback.submited_at)}
                  </Text>
                  <Text className="text-lg font-normal text-black ml-2">
                    {"\n" + feedback.description}
                  </Text>
                </Text>
              ))}
            </View>
          </>
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

        <ImageModal
          fullImageModalVisible={fullImageModalVisible}
          setFullImageModalVisible={setFullImageModalVisible}
          selectedImage={selectedImage}
        />

        <ReportLocationModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedReport={selectedReport}
        />

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
