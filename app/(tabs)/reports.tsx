import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");

const posts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  imageUri: "https://via.placeholder.com/150",
  description: `Image Description ${index + 1}`,
}));

export default function Reports() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity
          onPress={() => router.push('/pages/notification')}
        >
          <MaterialCommunityIcons
            name="bell"
            size={RFPercentage(3)}
            color="#ffffff"
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={width * 0.1} // Responsive icon size
              color="#000"
              style={styles.profileIcon}
            />
            <Text style={styles.profileName}>John Doe</Text>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <Text style={styles.imageText}>{item.description}</Text>
            <View style={styles.voteContainer}>
              <TouchableOpacity style={styles.voteButton}>
                <MaterialCommunityIcons
                  name="thumb-up"
                  size={width * 0.08} // Responsive icon size
                  color="#007BFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.voteButton}>
                <MaterialCommunityIcons
                  name="thumb-down"
                  size={width * 0.08} // Responsive icon size
                  color="#FF5722"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C3B2D",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: height * 0.01,
  },
  title: {
    color: "#ffffff",
    marginVertical: height * 0.02,
    fontSize: RFPercentage(4),
    fontFamily: "Roboto",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginLeft: width * 0.05,
  },
  postContainer: {
    width: width * 0.9,
    backgroundColor: "#F0F4C3",
    borderRadius: 20,
    alignItems: "center",
    padding: width * 0.05,
    marginVertical: height * 0.01,
    marginBottom: height * 0.02,
  },
  profileIcon: {
    marginVertical: height * 0.01,
  },
  profileName: {
    fontSize: RFPercentage(2.5),
    color: "#000000",
    marginVertical: height * 0.01,
  },
  image: {
    width: "100%",
    height: width * 0.6,
    borderRadius: 10,
    marginVertical: height * 0.01,
  },
  imageText: {
    color: "#000000",
    textAlign: "center",
    fontSize: RFPercentage(2),
    marginVertical: height * 0.01,
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: height * 0.02,
  },
  voteButton: {
    padding: width * 0.02,
  },
  titleContainer: {
    width: '100%',
    paddingHorizontal: width * 0.05,
    alignItems: 'center', // Center the title vertically
    flexDirection: 'row', // Keep icon and title in a row
    justifyContent: 'space-between',
  },
  notificationIcon: {
    marginLeft: width * 0.02,
  },
});
