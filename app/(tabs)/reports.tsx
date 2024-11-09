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
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import ReportReportModal from "@/components/reportReport";
import ReportValidationModal from "@/components/reportValidation";
import ReportLocationModal from "@/components/reportLocationModal";
import ImageModal from "@/components/imageModal";
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
import { Report, Reports } from "../utils/reports";
import { Picker } from "@react-native-picker/picker";
const db = getFirestore(app);

interface Location {
  latitude: number;
  longitude: number;
}

export default function ReportPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { USER_ID } = useAuth();
  const { getUserInfo } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [visibleReportsCount, setVisibleReportsCount] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<string>("Category");
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const categories = [
    "all",
    "fires",
    "street light",
    "potholes",
    "floods",
    "road accident",
    "others",
  ];
  const [feedbackStatus, setFeedbackStatus] = useState<{
    [key: string]: boolean;
  }>({});
  if (!USER_ID) {
    return;
  }
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
      "road accident",
    ];

    // Ensure we're only fetching reports from the selected category
    const categoriesToFetch =
      selectedCategory === "all" || selectedCategory === "Category"
        ? categories
        : [selectedCategory];

    const unsubscribeFunctions = categoriesToFetch.map((category) => {
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
              const voted = userVote ? userVote.vote : null; // Fetch user and worker feedback

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

              return {
                id: reportId,
                ...data,
                upvoteCount: upvotes,
                downvoteCount: downvotes,
                voted: voted,
                userFeedback: userFeedbackDescriptions, // Add user feedback
                workerFeedback: workerFeedbackDescriptions, // Add worker feedback
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

      console.log("Report submited successfully");
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
    loadReports(); // Trigger report fetch whenever the selected category or status changes
  }, [selectedCategory]); // Add both selectedCategory and selectedStatus to the dependency array

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category === "all" ? "Category" : category);
    setIsDropdownVisible(false); // Close dropdown after selection
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
      await Vote.handleDownvote(reportId, category, USER_ID);
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

  useEffect(() => {
    const checkFeedbackForReports = async () => {
      const feedbackCheckPromises = reports.map(async (report) => {
        const feedbackRef = doc(
          db,
          `reports/${report.type_of_report.toLowerCase()}/reports/${report.id}/validation/${USER_ID}`
        );
        const feedbackDoc = await getDoc(feedbackRef);
        return { id: report.id, exists: feedbackDoc.exists() };
      });

      try {
        const feedbackResults = await Promise.all(feedbackCheckPromises);
        const newFeedbackStatus: { [key: string]: boolean } =
          feedbackResults.reduce(
            (acc, { id, exists }) => {
              acc[id] = exists;
              return acc;
            },
            {} as { [key: string]: boolean }
          );
        setFeedbackStatus(newFeedbackStatus);
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };

    if (reports.length > 0) {
      checkFeedbackForReports();
    }
  }, [reports, USER_ID]);

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

  const handleOpenImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setFullImageModalVisible(true);
  };

  const renderItem = ({ item }: { item: Report }) => {
    const [datePart, timePart] = item.report_date.split("T");
    const formattedDate = datePart.replace(/-/g, "/");
    const formattedTime = timePart.split(".")[0];
    const feedbackExists = feedbackStatus[item.id] || false;

    return (
      <View className="w-full px-3">
        <View className="bg-white w-full rounded-[20px] border-2 border-[#0C3B2D] p-4 my-2 mb-4">
          <View className="flex flex-row w-full items-center">
            <MaterialCommunityIcons
              name="account-circle"
              size={RFPercentage(5)}
              style={{ padding: 5, color: "#0C3B2D" }}
            />
            <View className="flex flex-col items-start">
              <View className="relative">
                <TouchableOpacity
                  onPress={() => {
                    setModalMessage(
                      `Status of the Report is: ${item.status.toUpperCase()}`
                    );
                    setIsSuccess(false);
                    setIsModalVisible(true);
                  }}
                >
                  <View
                    className={`absolute top-0 left-60 w-8 h-8 border rounded-full mt-2 mr-2 ${
                      item.status === "pending"
                        ? "bg-yellow-400" // Amber for pending
                        : item.status === "ongoing"
                          ? "bg-blue-500" // Blue for ongoing
                          : item.status === "pending_review"
                            ? "bg-orange-500" // Orange for pending review
                            : item.status === "done"
                              ? "bg-green-500" // Green for done
                              : "bg-gray-400" // Default gray if no status
                    }`}
                  />
                </TouchableOpacity>
              </View>
              <Text className="pl-3 text-xl font-bold">
                {item.username.length > 18
                  ? item.username.slice(0, 18) + "..."
                  : item.username}
              </Text>
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
                    onPress={() => {
                      if (!isVerified) {
                        setModalMessage(
                          "You are not verified. Please verify your account before upvoting the report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else handleUpvote(item.id, item.type_of_report);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        item.voted === "upvote"
                          ? "thumb-up"
                          : "thumb-up-outline"
                      }
                      size={width * 0.06}
                      color={isVerified ? "#0C3B2D" : "#A0A0A0"}
                      paddingHorizontal={10}
                    />
                  </TouchableOpacity>
                  <Text className="text-lg mx-1">{item.upvoteCount}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isVerified) {
                        setModalMessage(
                          "You are not verified. Please verify your account before downvoting the report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else handleDownvote(item.id, item.type_of_report);
                    }}
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
                      setModalMessage("");
                      if (!isVerified) {
                        setModalMessage(
                          "You are not verified. Please verify your account before validating the report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else if (item.user_id.toString() === USER_ID) {
                        setModalMessage(
                          "You cannot mark your own report as False."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else {
                        setSelectedReport(item); // Ensure the selected report is set
                        setReportModalVisible(true); // Then open the report modal
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name="format-align-justify"
                      size={width * 0.06}
                      color={
                        isVerified && item.user_id.toString() !== USER_ID
                          ? "#0C3B2D"
                          : "#A0A0A0"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="w-full flex flex-row">
                <View className="flex-1 mr-3">
                  <TouchableOpacity
                    className={`bg-[#0C3B2D] border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ${
                      !isVerified ||
                      item.user_id.toString() === USER_ID ||
                      feedbackExists
                        ? "opacity-50"
                        : ""
                    }`}
                    // onPress={onValidate} handleReportValidate
                    onPress={() => {
                      setIsSuccess(false);
                      setModalMessage("");
                      if (!isVerified) {
                        setModalMessage(
                          "You are not verified. Please verify your account before validating the report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else if (item.user_id.toString() === USER_ID) {
                        setModalMessage("You cannot validate your own report.");
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else if (feedbackExists) {
                        setModalMessage(
                          "You have already validated this report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else {
                        setSelectedReport(item);
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      }
                    }}
                  >
                    <Text className="text-md font-semibold text-white px-4">
                      Verify Report
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    className={`bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ${
                      !isVerified || item.user_id.toString() === USER_ID
                        ? "opacity-50"
                        : ""
                    }`}
                    onPress={() => {
                      setModalMessage("");
                      if (!isVerified) {
                        setModalMessage(
                          "You are not verified. Please verify your account before validating the report."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else if (item.user_id.toString() === USER_ID) {
                        setModalMessage(
                          "You cannot mark your own report as False."
                        );
                        setIsSuccess(false);
                        setIsModalVisible(true);
                      } else {
                        setSelectedReport(item); // Ensure the selected report is set
                        setReportModalVisible(true); // Then open the report modal
                      }
                    }}
                  >
                    <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                      Mark as False
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          {item.status === "pending_review" && (
            <View className="w-full flex flex-col mt-2">
              <View className="w-full h-px bg-slate-300 mb-2" />
              <Text className="text-xl font-bold">Feedback:</Text>
              {item.workerFeedback?.map((feedback, index) => (
                <Text
                  key={index}
                  className="text-lg text-left pr-2 font-semibold text-slate-700"
                >
                  Worker:
                  <Text className="text-lg font-normal text-black ml-2">
                    {"   " + feedback.description + "\n"}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-500 ml-2 mt-3 items-center">
                    {formatDate(feedback.submited_at)}
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
                    Worker:
                    <Text className="text-lg font-normal text-black ml-2">
                      {"   " + feedback.description + "\n"}
                    </Text>
                    <Text className="text-xs font-semibold text-slate-500 ml-2 mt-3 items-center">
                      {formatDate(feedback.submited_at)}
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
                    {item.username + ":"}
                    <Text className="text-lg font-normal text-black ml-2">
                      {"   " + feedback.description + "\n"}
                    </Text>
                    <Text className="text-xs font-semibold text-slate-500 ml-2 mt-3 items-center">
                      {formatDate(feedback.submited_at)}
                    </Text>
                  </Text>
                ))}
              </View>
            </>
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

        <View className="w-full px-4 flex flex-row">
          <TouchableOpacity
            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
            className="h-12 bg-white border-2 border-[#0C3B2D] rounded-full flex justify-between items-center mx-3 px-4 flex-row"
          >
            <Text className="text-normal text-[#0C3B2D]">
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
            </Text>
            <MaterialCommunityIcons
              name={
                isDropdownVisible ? "menu-right-outline" : "menu-down-outline"
              }
              size={width * 0.05} // Responsive icon size
              color="#0C3B2D"
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {isDropdownVisible && (
            <View className="absolute top-16 left-7 bg-white border border-[#0C3B2D] rounded-2xl shadow-lg z-50">
              <FlatList
                data={categories}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectCategory(item)}
                    className="px-4 py-2"
                  >
                    <Text className="text-base text-[#0C3B2D]">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>
          )}
        </View>

        {reports.length === 0 ? (
          <View className="flex-1 justify-center items-center -z-10">
            <Text className="text-lg text-slate-500">No reports yet</Text>
          </View>
        ) : (
          <FlatList
            data={reports.slice(0, visibleReportsCount)}
            keyExtractor={(item, index) => `${item.id}-${index}}`}
            className="w-full h-auto flex p-4 mt-2 -z-10"
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
        )}

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

        <ReportValidationModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onConfirmValidation={confirmValidation}
          isSuccess={isSuccess}
          modalMessage={modalMessage}
        />

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

        <View className="p-2">
          <MaterialCommunityIcons
            name="thumb-down-outline"
            size={width * 0.15} // Responsive icon size
            color="#0C3B2D"
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
