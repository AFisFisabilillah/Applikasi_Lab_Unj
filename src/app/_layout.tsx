import '@/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#09110c' : '#eef2f0',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/login" />
      </Stack>
    </>
  );
}
