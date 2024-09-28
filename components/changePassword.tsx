import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ChangePasswordModalProps {
  visible: boolean;
  onConfirm: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  onCancel: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
      setSuccess(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    setLoading(true);
    setSuccess(false);
    setErrorMessage(null); // Clear previous errors

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      // Add any additional validation here (e.g., password length)

      await onConfirm(currentPassword, newPassword, confirmPassword);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message); // Capture the error message
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {errorMessage && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="close-circle"
                size={RFPercentage(2.5)}
                color="red"
              />
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}
          {!success ? (
            <>
              <Text style={styles.modalTitle}>Change Password</Text>

              {/* Current Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrent(!showCurrent)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showCurrent ? "eye" : "eye-off"}
                    size={RFPercentage(2.5)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showNew ? "eye" : "eye-off"}
                    size={RFPercentage(2.5)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm New Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirm ? "eye" : "eye-off"}
                    size={RFPercentage(2.5)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={RFPercentage(4)}
                color="#4CAF50"
              />
              <Text style={styles.successMessage}>
                Password changed successfully!
              </Text>
              <TouchableOpacity style={styles.successButton} onPress={onCancel}>
                <Text style={styles.successText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#F0F4C3",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#0C3B2D",
    borderRadius: 5,
    padding: 10,
    fontSize: RFPercentage(2),
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#0C3B2D",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: RFPercentage(2),
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  successMessage: {
    fontSize: RFPercentage(2.5),
    marginVertical: 10,
  },
  successButton: {
    backgroundColor: "#0C3B2D",
    padding: width * 0.02,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  successText: {
    color: "#ffffff",
    fontSize: RFPercentage(2),
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    marginLeft: 5,
    fontSize: RFPercentage(2),
  },
});

export default ChangePasswordModal;
