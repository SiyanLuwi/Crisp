import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Circular Image for Profile */}
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image
        style={styles.profileImage}
      />
      
      {/* Basic Profile Info */}
      <Text style={styles.nameText}>John Doe</Text>
      <Text style={styles.infoText}>Software Engineer</Text>
      <Text style={styles.infoText}>johndoe@example.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C3B2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // This makes the image circular
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 20,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
});
