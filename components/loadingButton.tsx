import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Accept loading state
  style?: ViewStyle;
  textStyle?: ViewStyle;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ title, onPress, loading, style, textStyle }) => {
  const handlePress = () => {
    if (!loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#F0F4C3" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0C3B2D",
    width: "50%",
    padding: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: RFPercentage(2.5),
    color: "#F0F4C3",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LoadingButton;
