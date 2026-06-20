import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store/hooks';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006569',
        tabBarInactiveTintColor: '#7c8b81',
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
        <Tabs.Screen
            name="index"
            options={{
                title: 'Home',
                tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
            }}
        />
      <Tabs.Screen
        name="barang"
        options={{
          title: 'Barang',
          tabBarIcon: ({ color, size }) => <Feather name="package" size={size} color={color} />,
        }}
      />
        <Tabs.Screen
            name="scan"
            options={{
                title: 'Scan',
                tabBarIcon: ({ color, size }) => <Feather name="camera" size={size} color={color} />,
            }}
        />
      <Tabs.Screen
        name="pinjam"
        options={{
          title: 'Pinjam',
          tabBarIcon: ({ color, size }) => <Feather name="clipboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
