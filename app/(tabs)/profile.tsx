import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LogoutModal from "@/components/logout";
import ChangePasswordModal from "@/components/changePassword"; 
import SaveConfirmationModal from "@/components/saveConfirmModal";
import { router } from "expo-router";
const { width, height } = Dimensions.get("window");
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { citizenProfile } from "../api/apiService";

const queryClient = new QueryClient()

export default function Profile(){
  return (
    <QueryClientProvider client={queryClient}>
      <App/>
  </QueryClientProvider>
  )
}

function App() {
  const { data } = useQuery({ queryKey: ['groups'], queryFn: citizenProfile })
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  

  const [name, setName] = useState(data?.username || '');
  const [address, setAddress] = useState(data?.address || '');
  const [email, setEmail] = useState(data?.email || '');
  const [contact, setContact] = useState(data?.contact_number || '');

  // State to hold previous values
  const [prevValues, setPrevValues] = useState({ name, address, email, contact });

  const handleLogout = () => {
    console.log("User logged out");
    setLogoutModalVisible(false);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("Change password:", { currentPassword, newPassword, confirmPassword });
      setTimeout(() => {
        if (newPassword === confirmPassword && newPassword.length > 0) {
          console.log("Password changed successfully!");
          resolve();
        } else {
          reject(new Error("Passwords do not match or are invalid."));
        }
      }, 2000);
    });
  };

  const toggleEdit = () => {
    if (isEditing) {
      setShowSaveConfirmation(true); // Show confirmation when trying to save
    }
    setIsEditing(!isEditing);
  };

  const confirmSave = () => {
    console.log("Saved changes:", { name, address, email, contact });
    setPrevValues({ name, address, email, contact }); // Update previous values
    setShowSaveConfirmation(false);
    setIsEditing(false);
  };

  const cancelSave = () => {
    // Revert to previous values
    setName(prevValues.name);
    setAddress(prevValues.address);
    setEmail(prevValues.email);
    setContact(prevValues.contact);
    setShowSaveConfirmation(false);
    setIsEditing(false); // Exit edit mode
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Account</Text>
        <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.doorIcon}>
          <MaterialCommunityIcons name="door" size={RFPercentage(5)} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.nameText}
            value={name}
            editable={isEditing}
            onChangeText={setName}
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value={address}
            editable={isEditing}
            onChangeText={setAddress}
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value={email}
            editable={isEditing}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value={contact}
            editable={isEditing}
            onChangeText={setContact}
          />
        </View>
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyText}>Not Yet Verified</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/pages/verifyPage')}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonEdit} onPress={toggleEdit}>
            <Text style={styles.EditText}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPass} onPress={() => setChangePasswordModalVisible(true)}>
            <Text style={styles.TextPass}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={logoutModalVisible}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onConfirm={handleChangePassword}
        onCancel={() => setChangePasswordModalVisible(false)}
      />

      {/* Save Confirmation Modal */}
      <SaveConfirmationModal
        visible={showSaveConfirmation}
        onConfirm={confirmSave}
        onCancel={cancelSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0C3B2D",
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.04,
    marginVertical: height * 0.07,
    position: 'relative',
  },
  text: {
    fontSize: RFPercentage(4),
    color: "#ffffff",
    fontWeight: "bold",
  },
  doorIcon: {
    position: 'absolute',
    right: width * 0.05,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: height * 0.01,
  },
  profileImage: {
    width: width * 0.43,
    height: height * 0.2,
    borderRadius: 100,
    borderWidth: width * 0.01,
    borderColor: "#fff",
    marginBottom: height * 0.05,
  },
  nameText: {
    fontSize: RFPercentage(2.5),
    fontWeight: "bold",
    color: "#000000",
    marginBottom: height * 0.01,
    textAlign: "left",
    marginLeft: width * 0.03,
  },
  infoText: {
    fontSize: RFPercentage(2),
    color: "#000000",
    fontWeight: "bold",
    marginBottom: height * 0.01,
    textAlign: "left",
    marginLeft: width * 0.03,
  },
  infoContainer: {
    justifyContent: "center",
    marginBottom: height * 0.025,
    backgroundColor: "#F0F4C3",
    borderRadius: 10,
    width: width * 0.8,
  },
  verifyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width * 0.8,
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
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    borderRadius: 10,
    borderColor: "#8BC34A",
    borderWidth: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: RFPercentage(2.5),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.6,
  },
  buttonEdit: {
    backgroundColor: "#0C3B2D",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    borderRadius: 10,
    marginRight: width * 0.06,
    borderColor: "#8BC34A",
    borderWidth: 0.5,
  },
  buttonPass: {
    backgroundColor: "#8BC34A",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
    marginLeft: width * 0.05,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  EditText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: RFPercentage(2.5),
  },
  TextPass: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: RFPercentage(2.5),
  },
});
