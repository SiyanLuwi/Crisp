import React, { useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Dimensions, StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Get screen dimensions
const { height, width } = Dimensions.get('window');

export default function CameraComp() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);


  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function capturePhoto() {
    if (cameraRef.current) {
      cameraRef.current.takePictureAsync({
        quality: 1, // Set the quality to 1 for high quality
        base64: true, // Optional: Get the photo as a base64 string
        skipProcessing: false, // Make sure processing is enabled
      }).then(photo => {
        console.log('Photo captured:', photo);
      }).catch(error => {
        console.error('Error capturing photo:', error);
      });
    }
  }
  

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <MaterialCommunityIcons name="camera" size={width * 0.15} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-switch" size={width * 0.1} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: width * 0.05,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    width: width * 0.2, 
    height: width * 0.2, 
    borderRadius: (width * 0.2) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.1,
    borderWidth: 1,
    borderColor: 'white',
  },
  flipButton: {
    position: 'absolute',
    right: width * 0.05, 
    bottom: height * 0.01,
  },
  text: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: 'white',
  },
});
