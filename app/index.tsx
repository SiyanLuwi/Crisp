import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import bgImage from "@/assets/images/landing_page.png";


// Get screen dimensions
const { width, height } = Dimensions.get("window");

export default function Index() {
  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.bgImage} />
      <Text style={styles.Title}>CRISP</Text>
      <Text style={styles.context}>
        A Smarter Way to Protect{"\n"}Your Neighborhood
      </Text>
      <TouchableOpacity
        style={styles.loginContainer}
        onPress={() => router.navigate(`/login`)}
      >
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerContainer} onPress={() => router.navigate(`/register`)}>
        <Text style={styles.regText}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loginContainer: {
    position: "absolute",
    bottom: height * 0.2,
    alignSelf: "center",
    backgroundColor: "#0C3B2D",
    borderColor: "#8BC34A",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: width * 0.1,
    borderRadius: 30,
    zIndex: 1,
  },
  loginText: {
    color: "#ffffff",
    fontSize: RFPercentage(2.5),
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  registerContainer: {
    position: "absolute",
    bottom: height * 0.1,
    alignSelf: "center",
    backgroundColor: "#8BC34A",
    paddingVertical: 10,
    paddingHorizontal: width * 0.1,
    borderRadius: 30,
    zIndex: 1,
  },
  regText: {
    color: "#000000",
    fontSize: RFPercentage(2.5),
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  context: {
    position: "absolute",
    left: width * 0.1,
    bottom: height * 0.3,
    color: "#ffffff",
    fontSize: RFPercentage(2.5),
    fontFamily: "Roboto",
    fontWeight: "bold",
    textAlign: "left",
  },
  Title: {
    position: "absolute",
    left: width * 0.1,
    bottom: height * 0.35,
    color: "#ffffff",
    fontSize: RFPercentage(9),
    fontFamily: "Roboto",
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 20,
  },
});
