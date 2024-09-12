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
const { height, width } = Dimensions.get("window");

const posts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  imageUri: "https://via.placeholder.com/150",
  description: `Image Description ${index + 1}`,
}));

export default function Reports() {
  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Text style={styles.title}>Reports</Text>
      <SafeAreaView />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={40}
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
                  size={24}
                  color="#007BFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.voteButton}>
                <MaterialCommunityIcons
                  name="thumb-down"
                  size={24}
                  color="#FF5722"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C3B2D",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {},
  title: {
    color: "#ffffff",
    fontSize: 40,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  postContainer: {
    width: width * 0.9,
    height: height * 0.75,
    backgroundColor: "#F0F4C3",
    borderRadius: 20,
    alignItems: "center",
    padding: 10,
    justifyContent: "space-between",
    marginVertical: 10,
  },
  profileIcon: {

  },
  profileName:{

  },
  image: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
  },
  imageText: {
    color: "#000000",
    textAlign: "center",
    marginVertical: 5,
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  voteButton: {
    padding: 10,
  },
  text: {
    fontFamily: "Roboto",
    fontSize: 24,
  },
});
