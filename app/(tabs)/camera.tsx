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
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  useEffect(() => {
    if (capturedUri) {
      resizeAndClassifyImage(capturedUri);
    }
  }, [capturedUri]);
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          setLoading(false);
          return;
        }
        await SecureStore.setItemAsync("currentLocation", `${latitude},${longitude}`);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, []);

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
      setLoading(true);
      const photo = cameraRef.current
        ? await cameraRef.current.takePictureAsync({ quality: 0.8 })
        : null;

      if (photo && photo.uri) {
        console.log("Photo captured:", photo.uri);

        // Save the image URI and navigate immediately
        await SecureStore.setItemAsync("imageUri", photo.uri);
        router.push("/pages/pictureForm");

        // Set captured URI to initiate background processing
        setCapturedUri(photo.uri);
      } else {
        console.error("Photo capturing failed: photo is undefined.");
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("Error capturing photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resizeAndClassifyImage = async (uri: string) => {
    try {
      // Resize the image
      const optimizedUri = await resizeImage(uri);
      // Classify the resized image
      await classify_image(optimizedUri);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const resizeImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 224, height: 224 } }],
        { format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri;
    }
  };

  const classify_image = async (uri: string) => {
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

      const result = getHighestConfidenceClass(res.data.predictions, 0.7);

      if (result) {
        console.log("Classified result:", result.class);
        const emergencyStatus =
          ["Fires", "Floods", "Road Accident"].includes(result.class) ? "Yes" : "No";
        await SecureStore.setItemAsync("isEmergency", emergencyStatus);
        await SecureStore.setItemAsync("report_type", result.class);
      } else {
        console.log("Result null!");
      }
    } catch (error: any) {
      console.error("Error during classification:", error.message);
      alert("Error classifying image. Please try again.");
    }
  };

  const getHighestConfidenceClass = (results: Prediction[], threshold = 0.7) => {
    const highConfidenceResult = results.filter(result => result.confidence >= threshold);
    return highConfidenceResult.length
      ? highConfidenceResult.reduce((prev, current) => prev.confidence > current.confidence ? prev : current)
      : null;
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
