import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function VerifyPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [idPicture, setIdPicture] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleVerify = () => {
    console.log("Verifying with inputs:", { name, address, birthday, idNumber, selfie, idPhoto, idPicture });
    setModalVisible(true); // Show modal when verifying
  
    // Simulate verification process
    setTimeout(() => {
      setModalVisible(false); // Close modal
      router.back(); // Navigate back after verification
    }, 2000); // Auto close modal after 2 seconds (for demonstration)
  };
  

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setIdPhoto(result.assets[0].uri);
      }
    }
  };

  const takeSelfie = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setSelfie(result.assets[0].uri);
      }
    }
  };

  const takeIdPicture = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setIdPicture(result.assets[0].uri);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Verify Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Birthday"
          value={birthday}
          onChangeText={setBirthday}
        />
        <TextInput
          style={styles.input}
          placeholder="ID Number"
          value={idNumber}
          onChangeText={setIdNumber}
        />
      </View>

      {/* ID Photo Upload Button */}
      <View style={styles.verifyContainer}>
        <Text style={styles.verifyText}>Upload ID Photo</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Selfie with ID Button */}
      <View style={styles.verifyContainer}>
        <Text style={styles.verifyText}>Take a Selfie with ID</Text>
        <TouchableOpacity style={styles.button} onPress={takeSelfie}>
          <Text style={styles.buttonText}>Take Selfie</Text>
        </TouchableOpacity>
      </View>

      {/* Take Picture of ID Button */}
      <View style={styles.verifyContainer}>
        <Text style={styles.verifyText}>Take a Picture of the ID</Text>
        <TouchableOpacity style={styles.button} onPress={takeIdPicture}>
          <Text style={styles.buttonText}>Capture ID</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Verification */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Wait for Verification</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0C3B2D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    position: "absolute",
    fontSize: RFPercentage(4),
    color: "#ffffff",
    fontWeight: "bold",
    top: height * 0.07,
  },
  inputContainer: {
    width: width * 0.88,
  },
  input: {
    backgroundColor: "#F0F4C3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: RFPercentage(2.5),
  },
  verifyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width * 0.88,
    backgroundColor: "#F0F4C3",
    borderRadius: 10,
    marginBottom: height * 0.025,
  },
  verifyText: {
    fontSize: RFPercentage(2.5),
    color: "#000000",
    fontWeight: "bold",
    marginLeft: width * 0.05,
  },
  button: {
    backgroundColor: "#0C3B2D",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8BC34A",
    marginRight: width * 0,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  verifyButton: {
    backgroundColor: "#0C3B2D",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8BC34A",
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#8BC34A",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: "#F0F4C3",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: RFPercentage(3),
    color: "#000000",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#0C3B2D",
    padding: 10,
    borderRadius: 5,
  },
});
