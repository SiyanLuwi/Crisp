import React, { useEffect, useState } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import axios from "axios";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import SosPage from "@/components/sosPage";
import { getAddressFromCoordinates } from "../utils/convertCoordinatesToAddress";

// Get screen dimensions
const { height, width } = Dimensions.get("window");

interface Prediction {
  class: string;
  class_id: number;
  confidence: number;
}

export default function CameraComp() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [emergencyCall, setEmergencyCall] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  

  // Inside your component
  useEffect(() => {
    console.log("Checking location permission...");
    const fetchLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
    };

    fetchLocationPermission();
  }, []);

  useEffect(() => {
    console.log("Location permission granted:", locationPermissionGranted);
    const getCurrentLocation = async () => {
      if (!locationPermissionGranted) return;

      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        console.log(`Current location: ${latitude}, ${longitude}`);

        // Await the address fetching
        const address = await getAddressFromCoordinates(latitude, longitude);
        console.log("Fetched address:", address);
        console.log("Fetched lat and long:", latitude, longitude);

        // Store the current location as a string
        await SecureStore.setItemAsync("currentLocation", `${address}`);
        if (!latitude || !longitude) {
          return;
        }
        await SecureStore.setItemAsync(
          "coordinates",
          `${latitude}, ${longitude}`
        );
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getCurrentLocation();
  }, [locationPermissionGranted]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <Text className="items-center justify-center text-2xl font-bold">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
  
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3, // Reduce quality for faster processing
        base64: false,
        skipProcessing: true,
      });
      if (!photo?.uri) {
        console.error("Photo capturing failed: photo is undefined.");
        Alert.alert("Error capturing photo. Please try again.");
        return;
      }

      const optimizedUriPromise = resizeImage(photo.uri);  
  
      const optimizedUri = await optimizedUriPromise;
   
      const classificationResultPromise = classifyImage(optimizedUri);

      const classificationResult = await classificationResultPromise;
      
      // Store results securely
      await SecureStore.setItemAsync("imageUri", photo.uri);
      await SecureStore.setItemAsync("isEmergency", classificationResult.isEmergency);
      await SecureStore.setItemAsync("report_type", classificationResult.class);
  
      router.push("/pages/pictureForm");
  
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error capturing photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const resizeImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(uri, [{ resize: { width: 640, height: 480 } }], { format: SaveFormat.JPEG });
      return result.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri; // Return original image URI if resizing fails
    }
  };
  

  const classifyImage = async (uri: string) => {
    try {
      const base64image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const res = await axios.post(
        "https://detect.roboflow.com/image_classification_fv/1",
        base64image,
        {
          params: { api_key: Constants.expoConfig?.extra?.ROBOFLOW_API_KEY },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const result = getHighestConfidenceClass(res.data.predictions);
      console.log("Classified result:", result);

      const classification = {
        class: result.class,
        isEmergency: ["Fires", "Floods", "Road Accident"].includes(result.class)
          ? "Yes"
          : "No",
      };
      console.log("Classification:", classification);

      return classification;
    } catch (error: any) {
      console.error("Error during classification:", error.message);
      Alert.alert("Error classifying image. Please try again.");
      return { class: "Unknown", isEmergency: "No" }; // Default return on error
    }
  };

  const getHighestConfidenceClass = (results: any[]) => {
    return results.reduce((prev, current) =>
      prev.confidence > current.confidence ? prev : current
    );
  };

  return (
    <View className="w-full h-full flex justify-center items-center">
      <CameraView
        className="w-full h-full flex justify-center items-center"
        facing={facing}
        ref={cameraRef}
      >
        <View className="absolute top-[5%] w-full flex-row justify-between">
          <TouchableOpacity className="m-5 ml-8" onPress={toggleCameraFacing}>
            <MaterialCommunityIcons
              name="camera-switch"
              size={width * 0.1}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="m-5 mr-8 mt-6"
            onPress={() => {
              setEmergencyCall(true); // Then open the report modal
            }}
          >
            <MaterialCommunityIcons
              name="phone-plus"
              size={width * 0.1}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-[13%] w-full flex-row justify-center">
          <TouchableOpacity
            className="w-auto h-full rounded-full bg-white justify-center items-center p-2 mx-[10%] border-2 border-[#0C3B2D]"
            onPress={capturePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={width * 0.15} color="#0C3B2D" />
            ) : (
              <MaterialCommunityIcons
                name="camera-iris"
                size={width * 0.15}
                color="#0C3B2D"
              />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>

      {emergencyCall && (
        <SosPage
          visible={emergencyCall}
          onClose={() => setEmergencyCall(false)} // Close SosPage when the user dismisses it
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraView: { width: "100%", height: "100%" },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { fontSize: 20, fontWeight: "bold" },
  cameraControls: {
    position: "absolute",
    top: "5%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: { margin: 5 },
  captureButtonContainer: {
    position: "absolute",
    bottom: "13%",
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0C3B2D",
  },
});
