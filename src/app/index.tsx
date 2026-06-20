import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { useAppSelector } from '@/store/hooks';

const LOGO_UNJ = require('../../assets/images/logo_unj.png');
const WELCOME_IMAGE = require('../../assets/welcome_image.svg');
const ADMIN_ACCESS_URL = 'https://labpteunj.web.id/login-admin-menu';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  const openAdminAccess = async () => {
    await WebBrowser.openBrowserAsync(ADMIN_ACCESS_URL);
  };

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, router]);

  return (
      <View className="relative flex-1 bg-background">
        <SafeAreaView edges={['top']} className="flex-1">
          <ScrollView
              showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <Image
                    source={LOGO_UNJ}
                    style={{ width: 46, height: 46 }}
                    contentFit="contain"
                />
              </View>

              <Text className="mt-3 text-center text-[12px] font-semibold uppercase tracking-[1px] text-primary">
                Universitas Negeri Jakarta
              </Text>

              <Text className="mt-2 max-w-[340px] text-center text-[26px] font-bold leading-[33px] text-text">
                Aplikasi Manajemen
                <Text className={"text-primary ml-0.5"}>
                  Laboratorium
                </Text>
              </Text>

            </View>

            <View className="mt-6 items-center">
              <Image
                  source={WELCOME_IMAGE}
                  style={{ width: '100%', height: 260 }}
                  contentFit="contain"
              />
            </View>
          </ScrollView>
        </SafeAreaView>

        <View className="absolute bottom-0 left-0 right-0 z-10 rounded-t-[32px] border-t border-border bg-white px-5 pt-6 pb-8 shadow-2xl">
          <SafeAreaView edges={['bottom']}>
            <Text className="text-center text-[20px] font-bold text-text">
              Mulai Sekarang
            </Text>

            <Text className="mt-2 text-center text-[13px] leading-5 text-text-muted">
              Masuk jika sudah punya akun, atau buat akun baru untuk mulai mengajukan peminjaman.
            </Text>

            <View className="mt-6 gap-3">
              <Link href="/register" asChild>
                <Pressable className="h-12 items-center justify-center rounded-xl bg-primary active:opacity-90">
                  <Text className="text-[15px] font-semibold text-primary-foreground">
                    Daftar
                  </Text>
                </Pressable>
              </Link>

              <Link href="/login" asChild>
                <Pressable className="h-12 items-center justify-center rounded-xl border border-input bg-surface-muted active:opacity-90">
                  <Text className="text-[15px] font-semibold text-text">
                    Login
                  </Text>
                </Pressable>
              </Link>

              <Pressable
                  onPress={openAdminAccess}
                  className="h-12 items-center justify-center rounded-xl border border-primary bg-white active:opacity-90"
              >
                <Text className="text-[15px] font-semibold text-primary">
                  Akses Admin
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </View>
  );
}
