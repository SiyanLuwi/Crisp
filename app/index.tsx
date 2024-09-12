import { StyleSheet, Text, View, Image, Button, Dimensions, Touchable, TouchableOpacity } from 'react-native';
import React from 'react';

import bgImage from "@/assets/images/landing_page.png";
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.bgImage} />
      <Text style={styles.Title}>CRISP</Text>
      <Text style={styles.context}>A Smarter Way to Protect{'\n'}Your Neighborhood</Text>
      <TouchableOpacity style={styles.registerContainer}>
        <Text style={styles.regText}>REGISTER</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginContainer} onPress={() => router.navigate(`/login`)}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    position: 'absolute',
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  loginContainer: {
    position: 'absolute',
    bottom: 120, 
    alignSelf: 'center',
    backgroundColor: '#0C3B2D',
    borderColor: '#8BC34A',
    borderWidth: 1, 
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 30,
    zIndex: 1,
  },
  loginText:{
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  registerContainer: {
    position: 'absolute',
    bottom: 50, 
    alignSelf: 'center',
    backgroundColor: '#8BC34A',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 30,
    zIndex: 1,
  },
  regText:{
    color: '#000000',
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  context:{
    position: 'absolute',
    bottom: 220,
    color: '#ffffff',
    right: 140,
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  Title: {
    position: 'absolute',
    bottom: 260,
    right: 160,
    color: '#ffffff',
    fontSize: 80,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 20,
  }
});