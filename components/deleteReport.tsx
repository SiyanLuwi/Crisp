import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

interface DeleteReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  visible,
  onClose,
}) => {
  const handleConfirm = () => {
    onClose(); // Use the modified close function
    console.log("Report deleted");
  };
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
            Delete Report
          </Text>
          <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
            Are you sure you want to delete your post?
          </Text>
          <View className="flex flex-row justify-end w-full mt-3  px-3">
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
            >
              <Text className="text-md font-semibold text-white px-4">
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
            >
              <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteReportModal;
