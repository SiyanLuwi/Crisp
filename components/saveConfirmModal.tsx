import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get("window");

interface SaveConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Save your current changes?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 59, 45, 0.5)', // Semi-transparent background matching your theme
  },
  modalContent: {
    width: width * 0.8,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#F0F4C3", // Light background color consistent with your app
    alignItems: "center",
  },
  modalText: {
    fontSize: RFPercentage(2.5),
    marginBottom: 20,
    textAlign: "center",
    color: "#000000", // Text color for contrast
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#0C3B2D", // Button color matching your theme
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: "#ffffff", // Text color for buttons
    fontSize: RFPercentage(2.5),
  },
});

export default SaveConfirmationModal;
