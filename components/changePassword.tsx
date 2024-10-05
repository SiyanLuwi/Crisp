import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
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
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          {!success ? (
            <>
              <View className="flex flex-col w-full px-3">
                <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5">
                  Change Password
                </Text>

                {/* Current Password Input */}
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                    placeholder="Current Password"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    className="text-lg p-3 items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name={showCurrent ? "eye" : "eye-off"}
                      size={RFPercentage(2.5)}
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>

                {/* New Password Input */}
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                    placeholder="New Password"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    className="text-lg p-3 items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name={showNew ? "eye" : "eye-off"}
                      size={RFPercentage(2.5)}
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm New Password Input */}
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="text-lg p-3 items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name={showConfirm ? "eye" : "eye-off"}
                      size={RFPercentage(2.5)}
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>

                {errorMessage && (
                  <View className="w-full flex items-start">
                    <Text className="text-md text-red-700 font-semibold mb-5">
                      {errorMessage}
                    </Text>
                  </View>
                )}

                <View className="flex flex-row justify-end w-full">
                  <TouchableOpacity
                    className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                    onPress={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-md font-semibold text-white px-4">
                        Confirm
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
                    onPress={onCancel}
                  >
                    <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View className="full p-3 bg-white rounded-xl items-start">
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                Password changed successfully!
              </Text>
              <View className="flex flex-row justify-end w-full ">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={onCancel}
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;
