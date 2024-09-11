import { StyleSheet, View, Text } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tab Two</Text>
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
