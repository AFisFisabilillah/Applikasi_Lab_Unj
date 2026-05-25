import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from 'expo-router';
import { useColorScheme } from 'react-native';
import "../global.css";


export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
      <Stack>
          <Stack.Screen name="index" ></Stack.Screen>
      </Stack>
  );
}
