import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { clearAuthError, logoutUser } from '@/slice/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3 border-b border-border/70 py-4">
      <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Feather name={icon} size={16} color="#006569" />
      </View>

      <View className="flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
          {label}
        </Text>
        <Text className="mt-1 text-[15px] leading-6 text-text">{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isHydrated, isLoading, currentAction, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, router]);

  const initials = useMemo(() => {
    const source = user?.nama?.trim();
    if (!source) {
      return 'U';
    }

    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [user?.nama]);

  const joinedDate = useMemo(() => {
    if (!user?.created_at) {
      return '-';
    }

    return new Date(user.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [user?.created_at]);

  const statusLabel = user?.status?.trim() || 'Aktif';
  const userTypeLabel = user?.type_user?.trim() || 'Pengguna';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
      >
        <View className="gap-1">
          <Text className="text-[24px] font-bold text-black">Profile</Text>
          <Text className="text-[13px] leading-5 text-text-muted">
            Informasi akun untuk akses peminjaman barang laboratorium.
          </Text>
        </View>

        <View className="mt-5 rounded-[24px] bg-primary px-5 py-5">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/16">
              <Text className="text-[22px] font-bold text-white">{initials}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[20px] font-semibold text-white">{user?.nama || '-'}</Text>
              <Text className="mt-1 text-[13px] text-white/80">{user?.email || '-'}</Text>
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-white/14 px-3 py-1.5">
              <Text className="text-[12px] font-medium text-white">{userTypeLabel}</Text>
            </View>
            <View className="rounded-full bg-white/14 px-3 py-1.5">
              <Text className="text-[12px] font-medium text-white">{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-[24px] border border-border/70 bg-surface px-5 py-2">
          <ProfileRow icon="credit-card" label="NIM / NIP" value={user?.nim_nip || '-'} />
          <ProfileRow icon="briefcase" label="Fakultas" value={user?.fakultas || '-'} />
          <ProfileRow icon="book-open" label="Program Studi" value={user?.prodi || '-'} />
          <View className="py-4">
            <View className="flex-row items-start gap-3">
              <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Feather name="calendar" size={16} color="#006569" />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                  Bergabung Sejak
                </Text>
                <Text className="mt-1 text-[15px] leading-6 text-text">{joinedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {error ? (
          <View className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Text className="text-[13px] leading-5 text-rose-700">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            dispatch(clearAuthError());
            dispatch(logoutUser());
          }}
          disabled={isLoading && currentAction === 'logout'}
          className="mt-6 h-12 flex-row items-center justify-center rounded-2xl bg-primary active:opacity-90"
        >
          {isLoading && currentAction === 'logout' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Feather name="log-out" size={16} color="#ffffff" />
              <Text className="ml-2 text-[15px] font-semibold text-white">Logout</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
