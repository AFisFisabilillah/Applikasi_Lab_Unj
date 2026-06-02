import { memo, useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { clearDashboardError, fetchDashboard } from '@/slice/dashboardSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { DashboardBarangTersediaItem, DashboardLoanItem } from '@/types/Dashboard';

const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const STITCH_LOGO_BG = require('../../../assets/stitch/unj-logo-bg.png');
const STITCH_PROJECTOR = require('../../../assets/stitch/proyektor-epson.png');
const STITCH_HDMI = require('../../../assets/stitch/kabel-hdmi.png');
const TAB_BAR_SPACING = 108;

const STYLES = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
  },
  contentContainerEmpty: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  horizontalListContent: {
    paddingRight: 20,
  },
});

const QUICK_ACTIONS = [
  {
    key: 'pinjam',
    icon: 'plus-circle' as const,
    label: 'Pinjam Barang',
    route: '/(tabs)/barang',
    variant: 'primary' as const,
  },
  {
    key: 'barang',
    icon: 'archive' as const,
    label: 'Lihat Barang',
    route: '/(tabs)/barang',
    variant: 'secondary' as const,
  },
  {
    key: 'riwayat',
    icon: 'rotate-ccw' as const,
    label: 'Riwayat',
    route: '/(tabs)/pinjam',
    variant: 'secondary' as const,
  },
  {
    key: 'profil',
    icon: 'user' as const,
    label: 'Profil',
    route: '/(tabs)/profile',
    variant: 'secondary' as const,
  },
];

const AVAILABLE_IMAGE_FALLBACKS = [STITCH_PROJECTOR, STITCH_HDMI];

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return '-';
  }

  const normalized = dateValue.includes('T') ? dateValue : dateValue.replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return DATE_FORMATTER.format(date);
}

function getStatusTone(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'belum dikembalikan') {
    return {
      badge: 'bg-rose-100',
      text: 'text-rose-700',
      icon: '#be123c',
    };
  }

  if (normalized === 'sudah dikembalikan' || normalized === 'dikembalikan') {
    return {
      badge: 'bg-primary/10',
      text: 'text-primary',
      icon: '#006569',
    };
  }

  return {
    badge: 'bg-slate-100',
    text: 'text-slate-700',
    icon: '#475569',
  };
}

function getLoanIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('laptop')) {
    return 'monitor';
  }

  if (normalized.includes('kamera')) {
    return 'camera';
  }

  if (normalized.includes('microphone') || normalized.includes('mic')) {
    return 'mic';
  }

  if (normalized.includes('tripod')) {
    return 'triangle';
  }

  if (normalized.includes('proyektor')) {
    return 'video';
  }

  return 'package';
}

function getActiveLoanCount(loan: Record<string, number> | undefined) {
  if (!loan) {
    return 0;
  }

  const activeEntry = Object.entries(loan).find(([key]) => key.trim().toLowerCase() === 'belum dikembalikan');
  return activeEntry?.[1] ?? 0;
}

type HeaderBarProps = {
  userName: string;
};

const HeaderBar = memo(function HeaderBar({ userName }: HeaderBarProps) {
  const initial = userName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center gap-3">
        <Pressable className="h-9 w-9 items-center justify-center rounded-full">
          <Feather name="menu" size={18} color="#3f4949" />
        </Pressable>

        <Text className="text-[20px] font-bold text-primary">UNJ Lab Inventory</Text>
      </View>

      <View className="h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-muted">
        <Text className="text-[11px] font-semibold text-primary">{initial}</Text>
      </View>
    </View>
  );
});

type ProfileCardProps = {
  userName: string;
  typeUser: string;
  fakultas: string;
  prodi: string;
  nimNip: string;
};

const ProfileCard = memo(function ProfileCard({
  userName,
  typeUser,
  fakultas,
  prodi,
  nimNip,
}: ProfileCardProps) {
  return (
    <View className="mx-5 rounded-xl border border-border/60 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[24px] font-semibold leading-8 text-text">Halo, {userName} </Text>
          <Text className="mt-1 text-[14px] leading-5 text-text-muted">
            {typeUser} • {fakultas}
          </Text>
          <Text className="text-[14px] leading-5 text-text-muted">{prodi}</Text>
          <Text className="text-[14px] leading-5 text-text-muted">{nimNip}</Text>
        </View>

        <View className="flex-row items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-primary" />
          <Text className="text-[11px] font-semibold uppercase text-primary">Aktif</Text>
        </View>
      </View>
    </View>
  );
});

type SummaryCardProps = {
  label: string;
  value: number;
};

const SummaryCard = memo(function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View className="flex-1 rounded-lg border border-border/60 bg-white px-3 py-3 shadow-sm">
      <Text className="text-center text-[20px] font-semibold text-primary">{value}</Text>
      <Text className="mt-1 text-center text-[11px] font-medium leading-4 text-text-muted">
        {label}
      </Text>
    </View>
  );
});

type QuickActionCardProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
};

const QuickActionCard = memo(function QuickActionCard({
  icon,
  label,
  variant,
  onPress,
}: QuickActionCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-lg px-4 py-4 ${
        isPrimary ? 'bg-primary' : 'border border-border/60 bg-white'
      }`}
    >
      <View className="items-center">
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${
            isPrimary ? 'bg-white/15' : 'bg-surface-muted'
          }`}
        >
          <Feather name={icon} size={18} color={isPrimary ? '#c7f4f6' : '#006569'} />
        </View>

        <Text
          className={`mt-3 text-center text-[12px] font-medium ${
            isPrimary ? 'text-white' : 'text-text'
          }`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
});

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

const SectionHeader = memo(function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[18px] font-semibold text-text">{title}</Text>

      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress}>
          <Text className="text-[12px] font-medium text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

type ActiveLoanCardProps = {
  item: DashboardLoanItem;
};

const ActiveLoanCard = memo(function ActiveLoanCard({ item }: ActiveLoanCardProps) {
  const tone = getStatusTone(item.status);
  const icon = getLoanIcon(item.nama_barang);

  return (
    <View className="rounded-xl border border-border/60 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface-muted">
          <Feather name={icon} size={18} color="#5f6367" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[18px] font-semibold text-text">{item.nama_barang}</Text>
            <View className={`rounded-full px-2 py-1 ${tone.badge}`}>
              <Text className={`text-[11px] font-semibold ${tone.text}`}>{item.status}</Text>
            </View>
          </View>

          <Text className="mt-1 text-[14px] text-text-muted">{item.kode_barang}</Text>

          <View className="mt-2 flex-row items-center">
            <Feather name="calendar" size={13} color="#60646C" />
            <Text className="ml-1.5 text-[11px] font-medium uppercase text-text-muted">
              {formatDate(item.tanggal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

type AvailableCardProps = {
  item: DashboardBarangTersediaItem;
  imageSource: string | number | null;
  onPress: () => void;
};

const AvailableCard = memo(function AvailableCard({
  item,
  imageSource,
  onPress,
}: AvailableCardProps) {
  return (
    <View className="mr-3 w-64 overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
      <View className="relative h-32 bg-surface-muted">
        {imageSource ? (
          <Image
            source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Feather name="package" size={24} color="#7c8b81" />
          </View>
        )}

        <View className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1">
          <Text className="text-[11px] font-medium text-text">Stok: {item.jumlah}</Text>
        </View>
      </View>

      <View className="flex-1 px-3 py-3">
        <Text className="text-[18px] font-semibold text-text" numberOfLines={1}>
          {item.nama}
        </Text>
        <Text className="mt-0.5 text-[11px] font-semibold uppercase text-text-muted">
          {item.kode_barang}
        </Text>
        <Text className="mt-2 flex-1 text-[13px] leading-5 text-text-muted" numberOfLines={2}>
          {item.deskripsi?.replace(/\r\n/g, '\n') || 'Barang tersedia untuk dipinjam.'}
        </Text>

        <Pressable onPress={onPress} className="mt-3 items-center rounded-lg border border-primary py-2">
          <Text className="text-[12px] font-medium text-primary">Pinjam</Text>
        </Pressable>
      </View>
    </View>
  );
});

type HistoryItemProps = {
  item: DashboardLoanItem;
};

const HistoryItem = memo(function HistoryItem({ item }: HistoryItemProps) {
  const tone = getStatusTone(item.status);
  const icon = getLoanIcon(item.nama_barang);

  return (
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
          <Feather name={icon} size={16} color="#5f6367" />
        </View>

        <View className="flex-1">
          <Text className="text-[16px] font-medium text-text">{item.nama_barang}</Text>
          <Text className="mt-0.5 text-[11px] font-semibold uppercase text-text-muted">
            {formatDate(item.tanggal)}
          </Text>
        </View>
      </View>

      <View className="ml-3 flex-row items-center gap-2">
        <View className={`rounded-full border px-2 py-1 ${tone.badge} border-transparent`}>
          <Text className={`text-[11px] font-semibold ${tone.text}`}>{item.status}</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#35445a" />
      </View>
    </View>
  );
});

const HistorySeparator = memo(function HistorySeparator() {
  return <View className="h-px bg-border/60" />;
});

const EmptyState = memo(function EmptyState() {
  return (
    <View className="mx-5 rounded-xl border border-dashed border-border bg-white px-4 py-6">
      <Text className="text-center text-[14px] leading-5 text-text-muted">
        Belum ada data dashboard yang bisa ditampilkan.
      </Text>
    </View>
  );
});

function availableKeyExtractor(item: DashboardBarangTersediaItem) {
  return item.id.toString();
}

function historyKeyExtractor(item: DashboardLoanItem) {
  return item.id.toString();
}

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAppSelector((state) => state.auth.user);
  const dashboardData = useAppSelector((state) => state.dashboard.data);
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const error = useAppSelector((state) => state.dashboard.error);

  const loadDashboard = useCallback(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (!dashboardData) {
      loadDashboard();
    }
  }, [dashboardData, loadDashboard]);

  const handleRefresh = useCallback(() => {
    dispatch(clearDashboardError());
    loadDashboard();
  }, [dispatch, loadDashboard]);

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route as never);
    },
    [router]
  );

  const userName = user?.nama ?? 'Budi Santoso';
  const userType = user?.type_user ?? 'Mahasiswa';
  const fakultas = user?.fakultas ?? 'Fakultas Teknik';
  const prodi = user?.prodi ?? 'S1 Pendidikan Teknik Informatika';
  const nimNip = user?.nim_nip ?? '1506721010';

  const activeLoans = dashboardData?.loanActive ?? [];
  const recentLoans = dashboardData?.loanRecent ?? [];
  const availableItems = dashboardData?.barangTersedia ?? [];

  const summary = useMemo(() => {
    const active = getActiveLoanCount(dashboardData?.loan);
    const total = dashboardData?.allLoan ?? recentLoans.length;
    const returned = Math.max(total - active, 0);

    return {
      active,
      returned,
      total,
    };
  }, [dashboardData?.allLoan, dashboardData?.loan, recentLoans.length]);

  const handleBarangPress = useCallback(() => {
    handleNavigate('/(tabs)/barang');
  }, [handleNavigate]);

  const handlePinjamPress = useCallback(() => {
    handleNavigate('/(tabs)/pinjam');
  }, [handleNavigate]);

  const renderAvailableItem = useCallback(
    ({ item, index }: { item: DashboardBarangTersediaItem; index: number }) => {
      const imageSource =
        item.gambar && process.env.EXPO_PUBLIC_API_URL
          ? `${process.env.EXPO_PUBLIC_API_URL}/storage/${item.gambar}`
          : AVAILABLE_IMAGE_FALLBACKS[index] ?? null;

      return <AvailableCard item={item} imageSource={imageSource} onPress={handleBarangPress} />;
    },
    [handleBarangPress]
  );

  const renderHistoryItem = useCallback(({ item }: { item: DashboardLoanItem }) => {
    return (
      <View className="mx-5">
        <HistoryItem item={item} />
      </View>
    );
  }, []);

  const headerComponent = useMemo(() => {
    return (
      <View className="relative">
        <Image
          source={STITCH_LOGO_BG}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.02 }}
          contentFit="cover"
        />

        <HeaderBar userName={userName} />

        <ProfileCard
          userName={userName}
          typeUser={userType}
          fakultas={fakultas}
          prodi={prodi}
          nimNip={nimNip}
        />

        <View className="mx-5 mt-4 flex-row gap-2">
          <SummaryCard label="Sedang Dipinjam" value={summary.active} />
          <SummaryCard label="Sudah Dikembalikan" value={summary.returned} />
          <SummaryCard label="Total Riwayat" value={summary.total} />
        </View>

        <View className="mx-5 mt-4 flex-row flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <View key={action.key} className="w-[48.5%]">
              <QuickActionCard
                icon={action.icon}
                label={action.label}
                variant={action.variant}
                onPress={() => handleNavigate(action.route)}
              />
            </View>
          ))}
        </View>

        <View className="mx-5 mt-6">
          <SectionHeader title="Peminjaman Aktif" />
          {activeLoans.length > 0 ? (
            <ActiveLoanCard item={activeLoans[0]} />
          ) : (
            <EmptyState />
          )}
        </View>

        <View className="mx-5 mt-6">
          <SectionHeader
            title="Barang Tersedia"
            actionLabel="Lihat Semua"
            onActionPress={handleBarangPress}
          />

          <FlatList
            data={availableItems}
            keyExtractor={availableKeyExtractor}
            renderItem={renderAvailableItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={STYLES.horizontalListContent}
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews
            ListEmptyComponent={<EmptyState />}
          />
        </View>

        <View className="mx-5 mt-6 mb-3">
          <SectionHeader
            title="Riwayat Terakhir"
            actionLabel="Lihat Semua"
            onActionPress={handlePinjamPress}
          />
        </View>

        {error ? (
          <View className="mx-5 mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Text className="text-[13px] leading-5 text-rose-700">{error}</Text>
          </View>
        ) : null}
      </View>
    );
  }, [
    activeLoans,
    availableItems,
    error,
    fakultas,
    handleBarangPress,
    handlePinjamPress,
    nimNip,
    prodi,
    renderAvailableItem,
    summary.active,
    summary.returned,
    summary.total,
    userName,
    userType,
  ]);

  const contentContainerStyle = useMemo(
    () => ({
      ...(recentLoans.length > 0 ? STYLES.contentContainer : STYLES.contentContainerEmpty),
      paddingBottom: TAB_BAR_SPACING + insets.bottom,
    }),
    [insets.bottom, recentLoans.length]
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlatList
        data={recentLoans}
        keyExtractor={historyKeyExtractor}
        renderItem={renderHistoryItem}
        ListHeaderComponent={headerComponent}
        ItemSeparatorComponent={HistorySeparator}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={<View className="h-6" />}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
      />

      {isLoading && !dashboardData ? (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color="#006569" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
