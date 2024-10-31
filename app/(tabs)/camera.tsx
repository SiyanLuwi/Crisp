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
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// Get screen dimensions
const { height, width } = Dimensions.get("window");

interface Prediction {
  class: string;
  class_id: number;
  confidence: number;
}

const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return result ? `${result.name}, ${result.city}, ${result.region}, ${result.country}` : "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
};

export default function CameraComp() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      await SecureStore.setItemAsync("report_type", '');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      // Get current location with high accuracy
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      if (address) {
        await SecureStore.setItemAsync("currentLocation", `${latitude}, ${longitude}`);
      } else {
        console.error("Failed to get address.");
      }
    };
    fetchLocation();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === "back" ? "front" : "back"));
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
      });

      if (photo?.uri) {
        const optimizedUri = await resizeImage(photo.uri);
        await SecureStore.setItemAsync("imageUri", photo.uri);
        await classifyImage(optimizedUri);
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

  const resizeImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 224, height: 224 } }],
        { compress: 0.4, format: SaveFormat.JPEG }
      );
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
      console.log("Classified result:", result.class);
      const emergencyStatus = ["Fires", "Floods", "Road Accident"].includes(result.class) ? "Yes" : "No";
      await SecureStore.setItemAsync("isEmergency", emergencyStatus);
      await SecureStore.setItemAsync("report_type", result.class);
      router.push('/pages/pictureForm');
    } catch (error:any) {
      console.error("Error during classification:", error.message);
      alert("Error classifying image. Please try again.");
    }
  };

  const getHighestConfidenceClass = (results: Prediction[]) => {
    return results.reduce((prev, current) => (prev.confidence > current.confidence ? prev : current));
  };

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.cameraView} facing={facing} ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-switch" size={width * 0.1} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={capturePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={width * 0.15} color="#0C3B2D" />
            ) : (
              <MaterialCommunityIcons name="camera-iris" size={width * 0.15} color="#0C3B2D" />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraView: { width: "100%", height: "100%" },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { fontSize: 20, fontWeight: "bold" },
  cameraControls: { position: "absolute", top: "5%", width: "100%", flexDirection: "row", justifyContent: "space-between" },
  iconButton: { margin: 5 },
  captureButtonContainer: { position: "absolute", bottom: "13%", width: "100%", alignItems: "center" },
  captureButton: { width: "15%", height: "15%", borderRadius: 75, backgroundColor: "white", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#0C3B2D" },
});
