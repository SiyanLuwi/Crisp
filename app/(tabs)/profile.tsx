import React, { useState } from "react";
import { StyleSheet, View, Text, Image, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LogoutModal from "@/components/logout"; // Adjust import path as needed
import ChangePasswordModal from "@/components/changePassword"; // Adjust import path as needed

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  const handleLogout = () => {
    console.log("User logged out");
    setLogoutModalVisible(false);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log("Change password:", { currentPassword, newPassword, confirmPassword });

        // Simulating API call
        setTimeout(() => {
            if (newPassword === confirmPassword && newPassword.length > 0) {
                // Simulate successful password change
                console.log("Password changed successfully!");
                resolve();
            } else {
                // Simulate an error
                reject(new Error("Passwords do not match or are invalid."));
            }
        }, 2000); // Simulated delay for the API call
    });
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Account</Text>
        <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.doorIcon}>
          <MaterialCommunityIcons 
            name="door" 
            size={RFPercentage(5)} 
            color="#ffffff" 
          />
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
            value="John Doe"
            editable={false}
            multiline={true}
            numberOfLines={1}
            textAlignVertical="center"
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value="116 Gonzales Street Barangay 74 Caloocan City"
            editable={false}
            multiline={true}
            numberOfLines={2}
            textAlignVertical="center"
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value="20210662m.berbon.seanlowie.bscs@gmail.com"
            editable={false}
            multiline={true}
            numberOfLines={1}
            textAlignVertical="center"
          />
        </View>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.infoText}
            value="0999123123112"
            editable={false}
            multiline={true}
            numberOfLines={1}
            textAlignVertical="center"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.verifyContainer}>
            <Text style={styles.verifyText}>Verify</Text>
            <TouchableOpacity style={styles.button} onPress={() => setChangePasswordModalVisible(true)}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonEdit}>
            <Text style={styles.EditText}>Edit</Text>
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
