import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = () => {
    if (email) {
      // Simulate sending email
      setMessage("Check your inbox for password reset instructions.");
      setEmail(""); // Clear the input
      setTimeout(() => {
        setMessage("");
        onClose(); // Close the modal after 3 seconds
      }, 3000); // Show for 3 seconds
    } else {
      setMessage("Please enter your email address.");
      setTimeout(() => {
        setMessage(""); // Clear the error message after 3 seconds
      }, 2000);
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Forgot Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleForgotPassword}>
            <Text style={styles.modalButtonText}>Send Email</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableOpacity>
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#F0F4C3",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#ffffff",
    width: "100%",
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#0C3B2D",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  closeModal: {
    marginTop: 10,
    color: "#0C3B2D",
    textDecorationLine: "underline",
  },
  message: {
    marginTop: 15,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ForgotPasswordModal;