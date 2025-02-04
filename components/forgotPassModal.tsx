import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
      setEmail(""); 
      setTimeout(() => {
        setMessage("");
        onClose(); 
        
      }, 3000); 
      
    } else {
      setMessage("Please enter your email address.");
      setTimeout(() => {
        setMessage(""); // Clear the error message after 3 seconds
      }, 2000);
    }
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust this value if needed
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 p-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
            <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5">
              Forgot Password
            </Text>
            <TextInput
              className="w-full h-auto bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
            />
            {message ? (
              <Text className="text-md text-red-800 font-semibold flex items-center w-full">
                {message}
              </Text>
            ) : null}
            <TouchableOpacity
              className="mt-5 w-full bg-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
              onPress={handleForgotPassword}
            >
              <Text className="text-md py-1 font-bold text-white">
                Send Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-2 w-full bg-white border border-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
              onPress={onClose}
            >
              <Text className="text-md py-1 font-bold text-[#0C3B2D] ">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
