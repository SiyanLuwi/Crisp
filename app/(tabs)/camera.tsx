import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Dimensions } from 'react-native';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CameraComp() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function capturePhoto() {
    // Capture photo logic here
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <MaterialCommunityIcons name="camera" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-switch" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const { height, width } = Dimensions.get("window"); // Add this line to define 'height' and 'width'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.1, 
    left: width * 0.3,
    right: 0,
    flexDirection: "row",
    justifyContent: "center", 
    alignItems: "center", 
  },
  captureButton: {
    width: 70,
    height: 70,
    marginRight: width * 0.1,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    marginLeft: width * 0.1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
