import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [idPicture, setIdPicture] = useState<string | null>(null);

  const handleConfirm = () => {
    handleClose(); // Use the modified close function
  };

  const handleClose = () => {
    setSelectedReason(null); // Reset state when closing
    onClose();
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
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
            <Text className="text-2xl font-extrabold text-[#0C3B2D] px-3">
              Feedback Form
            </Text>
            <View className="flex flex-col justify-center w-full mt-3 px-3">
              <TextInput
                className="w-full bg-slate-50 text-md p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                placeholderTextColor="#888"
                placeholder="Description"
                multiline={true}
                scrollEnabled={true}
                style={{
                  maxHeight: 150,
                  height: 150,
                }}
              />
              <View className="w-full flex flex-row justify-between items-center bg-white border border-[#0C3B2D] rounded-lg">
                <Text className="text-md font-bold text-[#888] p-4">
                  Take a Photo
                </Text>
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-4 rounded-lg"
                  onPress={takeIdPicture}
                >
                  <Text className="text-white text-md font-normal px-2">
                    Capture ID
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex flex-row justify-end w-full mt-6 px-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
              >
                <Text className="text-md font-semibold text-white px-4">
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClose}
                className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
              >
                <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FeedbackModal;
