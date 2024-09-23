import React from "react";
import { StyleSheet, View, Text, Image, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("window");

export default function Profile() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.text}>Account</Text>
      <View style={styles.container}>
        {/* Circular Image for Profile */}
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Placeholder image
          style={styles.profileImage}
        />

        {/* Basic Profile Info */}
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
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoContainer}></View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonEdit}>
              <Text style={styles.EditText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonLogout}>
              <Text style={styles.TextLogout}>Logout</Text>
            </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0C3B2D",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: height * 0.01,
  },
  text: {
    fontSize: RFPercentage(4),
    color: "#ffffff",
    textAlign: "center",
    marginVertical: height * 0.07,
    marginBottom: height * 0.05,
    fontWeight: "bold",
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
    paddingHorizontal: width * 0,
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
    justifyContent: "space-between",
    width: width * 0.6,
  },
  buttonEdit: {
    backgroundColor: "#0C3B2D",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.07,
    borderRadius: 10,
    borderColor: "#8BC34A", 
    borderWidth: 0.5, 
  },
  buttonLogout: {
    backgroundColor: "#8BC34A",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    borderRadius: 10,
    borderWidth: 0.5, 
  },
  EditText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: RFPercentage(2.5),
  },
  TextLogout: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: RFPercentage(2.5),
  },
});