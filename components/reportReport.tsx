import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

interface ReportReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const reasons = [
  "Spam",
  "Inappropriate Content",
  "Harassment",
  "False Information",
  "Other",
];

const ReportReportModal: React.FC<ReportReportModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedReason) {
      console.log("Reported for:", selectedReason);
      handleClose(); // Use the modified close function
    }
  };

  const handleClose = () => {
    setSelectedReason(null); // Reset state when closing
    onClose();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className={`w-full p-2 border-b border-[#0C3B2D] ${
        selectedReason === item ? "bg-[#E0E0E0]" : ""
      }`}
      onPress={() => setSelectedReason(item)}
    >
      <Text className="text-md font-semibold py-2">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          <Text className="text-2xl font-extrabold text-[#0C3B2D] px-3">
            Report Reason
          </Text>
          <View style={{ width: "100%", padding: 10 }}>
            <FlatList
              data={reasons}
              keyExtractor={(item) => item}
              renderItem={renderItem}
            />
          </View>
          <View className="flex flex-row justify-end w-full mt-3 px-3">
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
    </Modal>
  );
};

export default ReportReportModal;
