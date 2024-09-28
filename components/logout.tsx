import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { router } from 'expo-router';
import { useAuth } from '@/AuthContext/AuthContext';

const { width, height } = Dimensions.get("window");

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onConfirm, onCancel }) => {
  const { onLogout, authState } = useAuth()
  const handleConfirm = async () => {
    if(!authState){
      return
    }    
    onConfirm();await onLogout!()
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Are you sure you want to log out?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    padding: height * 0.05,
    backgroundColor: '#F0F4C3',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: RFPercentage(2.5),
    marginBottom: height * 0.02,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#0C3B2D',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 10,
    marginHorizontal: width * 0.02,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: RFPercentage(2),
  },
});

export default LogoutModal;