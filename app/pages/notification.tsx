import { StyleSheet, Text, View, FlatList, Dimensions, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";

const { height, width } = Dimensions.get("window");

// Generate random notifications
const types = ['emergency', 'road blockage', 'weather'];
const notifications = Array.from({ length: 20 }, (_, index) => {
  const type = types[Math.floor(Math.random() * types.length)];
  const content = type === 'emergency' 
    ? `Emergency Alert: Event ${index + 1}` 
    : type === 'road blockage' 
    ? `Road Blockage: Event ${index + 1}` 
    : `Weather Update: Event ${index + 1}`;
  return { id: index.toString(), type, content };
});

interface NotificationItemProps {
  content: string;
  type: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ content, type }) => (
  <TouchableOpacity style={styles.notificationContainer}>
    <View style={styles.notificationItem}>
      <MaterialCommunityIcons 
        name={type === 'emergency' ? "alert" : type === 'weather' ? "weather-rainy" : "road-variant"} 
        size={24} 
        color={type === 'emergency' ? "red" : type === 'weather' ? "blue" : "orange"} 
      />
      <Text style={styles.notificationText}>{content}</Text>
    </View>
  </TouchableOpacity>
);

export default function NotificationForm() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem content={item.content} type={item.type} />}
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
  title: {
    fontSize: RFPercentage(3), 
    color: "white",
    marginVertical: 20, 
    fontWeight: 'bold', 
  },
  notificationContainer: {
    marginVertical: 5, 
    width: width * 0.9,
    height: height * 0.1,
    borderRadius: 8,
    backgroundColor: '#1E4D3B',
    borderWidth: width * 0.005,
    elevation: 10,
    borderColor: '#0C3B2D',
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start", 
    padding: 15, 
  },
  notificationText: {
    color: "white",
    marginLeft: 10,
    flexWrap: 'wrap',
    fontSize: RFPercentage(2),
    width: width * 0.7, 
  },
});
