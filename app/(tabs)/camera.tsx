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

// Get screen dimensions
const { height, width } = Dimensions.get("window");

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

  function capturePhoto() {
    if (cameraRef.current) {
      setLoading(true); // Set loading state to true
      cameraRef.current
        .takePictureAsync({
          quality: 1, // Set the quality to 1 for high quality
          base64: true, // Optional: Get the photo as a base64 string
          skipProcessing: false, // Make sure processing is enabled
        })
        .then((photo) => {
          console.log("Photo captured:", photo);
          router.push("/pages/pictureForm");
        })
        .catch((error) => {
          console.error("Error capturing photo:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

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
              <ActivityIndicator size="large" color="white" />
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
