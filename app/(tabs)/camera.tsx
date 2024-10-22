import React, { useState } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import axios from "axios";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
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
  const [loading, setLoading] = useState(false); // Add loading state
  const cameraRef = React.useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="w-full h-full flex justify-center items-center">
        <Text className="items-center justify-center text-2xl font-bold">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  const capturePhoto = async () => {
    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      await SecureStore.setItemAsync(
        "currentLocation",
        `${latitude},${longitude}`
      );

      // Take a photo
      if (cameraRef.current) {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });

        if (photo && photo.uri && photo.base64) {
          console.log("Photo captured:", photo.uri);

          const [optimizedPhoto, isClassified] = await Promise.all([
            resizeImage(photo.uri),
            classify_image(photo.uri), // Classify original image without waiting for resize
          ]);

          // Save the image URI
          await SecureStore.setItemAsync("imageUri", photo.uri);

          // If classification succeeds, navigate to form
          if (isClassified) {
            router.push("/pages/pictureForm");
          }
        } else {
          console.error("Photo capturing failed: photo is undefined.");
        }
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("Error capturing photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 150, height: 150 } }],
        { compress: 1, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri; // Return original image URI if resizing fails
    }
  };

  const classify_image = async (uri: string) => {
    try {
      const base64image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send image for classification
      const res = await axios.post(
        "https://detect.roboflow.com/image_classification_v1.5/1",
        base64image,
        {
          params: { api_key: Constants.expoConfig?.extra?.ROBOFLOW_API_KEY },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const result = getHighestConfidenceClass(res.data.predictions);
      console.log("Classified result:", result.class);

      const emergencyStatus =
        result.class === "Fires" || result.class === "Floods" ? "Yes" : "No";
      await SecureStore.setItemAsync("isEmergency", emergencyStatus);
      await SecureStore.setItemAsync("report_type", result.class);
      return true; // Classification succeeded
    } catch (error: any) {
      console.error("Error during classification:", error.message);
      return false; // Classification failed
    }
  };

  const getHighestConfidenceClass = (results: Prediction[]) => {
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
              name="lightbulb-on"
              size={width * 0.1}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="m-5 mr-8 mt-6"
            onPress={toggleCameraFacing}
          >
            <MaterialCommunityIcons
              name="camera-switch"
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
    </View>
  );
}
