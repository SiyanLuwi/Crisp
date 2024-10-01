import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {router} from 'expo-router';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { height } = Dimensions.get("window");

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');

  const handleOtpChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(text) && text.length <= 6) {
      setOtp(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <TextInput
        style={styles.otpInput}
        placeholder="Enter OTP"
        placeholderTextColor="#888"
        keyboardType="numeric"
        maxLength={6}
        onChangeText={handleOtpChange}
        value={otp}
      />
      <TouchableOpacity style={styles.verifyButton} onPress={() => router.push(`/(tabs)/home`)}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4C3',
    padding: 20,
  },
  title: {
    color: '#0C3B2D',
    fontWeight: 'bold',
    fontSize: RFPercentage(5),
    marginBottom: height * 0.05,
  },
  otpInput: {
    backgroundColor: '#ffffff',
    width: '80%',
    fontSize: RFPercentage(2.5),
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#0C3B2D',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
});
