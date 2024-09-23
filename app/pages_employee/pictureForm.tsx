import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function PictureForm() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>SUBMIT REPORT</Text>
      <View style={styles.pictureContainer}>
        {/* Replace with actual image source if needed */}
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.picture}
        />
      </View>

      <TextInput style={styles.input} placeholder="Location" />

      <TextInput style={styles.input} placeholder="Emergency (yes/no)" />

      <TextInput style={styles.input} placeholder="Description" multiline />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Report Submitted")}
        >
          <Text style={styles.buttonText}>Submit Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0C3B2D",
  },
  text: {
    color: "#F0F4C3",
    fontWeight: "bold",
    fontSize: RFPercentage(5),
    textAlign: "center",
  },
  pictureContainer: {
    marginTop: height * 0.02,
    height: height * 0.5,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  picture: {
    width: width * 0.9,
    height: "100%",
    resizeMode: "cover",
  },
  input: {
    height: height * 0.06,
    backgroundColor: "#F0F4C3",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: height * 0.03,
    paddingHorizontal: 8,
    fontSize: RFPercentage(2.5),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#F0F4C3",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: RFPercentage(2.5),
  },
});
