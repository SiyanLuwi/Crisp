import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/AuthContext/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react'
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, animation:"fade" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation:"slide_from_bottom" }} />
        <Stack.Screen name="pages" options={{ headerShown: false, animation:"fade" }} />
        <Stack.Screen name="(tabs)_employee" options={{ headerShown: false, animation:"slide_from_bottom" }} />
        <Stack.Screen name="pages_employee" options={{ headerShown: false, animation:"fade" }} />
      </Stack>
    </ThemeProvider>
    </AuthProvider>
  );
}
