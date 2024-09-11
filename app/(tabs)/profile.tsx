import { StyleSheet, View, Text } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}> Profile Will be Here </Text>
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
    text: {
      color: '#ffffff', 
    },
  });