import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { clearPinjamError, fetchPinjams } from '@/slice/pinjamSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Pinjam } from '@/types/Pinjam';

type StatusTone = {
  container: string;
  text: string;
  dot: string;
};

function getStatusTone(status: string): StatusTone {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'sudah dikembalikan') {
    return {
      container: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: '#15803d',
    };
  }

  if (normalized === 'belum dikembalikan') {
    return {
      container: 'bg-amber-50',
      text: 'text-amber-700',
      dot: '#b45309',
    };
  }

  return {
    container: 'bg-slate-100',
    text: 'text-slate-700',
    dot: '#475569',
  };
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return '-';
  }

  const normalized = dateValue.includes('T') ? dateValue : dateValue.replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <View className="flex-1 rounded-lg border border-border/70 bg-surface px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Feather name={icon} size={18} color="#006569" />
      </View>
      <Text className="mt-4 text-[22px] font-bold text-text">{value}</Text>
      <Text className="mt-1 text-[12px] leading-5 text-text-muted">{label}</Text>
    </View>
  );
}

function LoanCard({ item }: { item: Pinjam }) {
  const tone = getStatusTone(item.status);

  return (
    <View className="rounded-lg border border-border/70 bg-surface px-4 py-4 shadow-sm">
      <View className="flex-row gap-4">
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
          {item.barang.gambar_url ? (
            <Image
              source={{ uri: item.barang.gambar_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={120}
            />
          ) : (
            <Feather name="package" size={22} color="#8c9a91" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-[15px] font-semibold leading-5 text-text">
              {item.nama_barang}
            </Text>
            <View className={`rounded-full px-2.5 py-1 ${tone.container}`}>
              <Text className={`text-[11px] font-semibold ${tone.text}`}>{item.status}</Text>
            </View>
          </View>

          <Text className="mt-1 text-[12px] font-medium uppercase text-text-muted">
            {item.kode_barang}
          </Text>

        </View>
      </View>

      <View className="mt-4 rounded-2xl bg-surface-muted px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-white">
              <Feather name="calendar" size={14} color="#006569" />
            </View>
            <View>
              <Text className="text-[11px] text-text-muted">Tanggal pinjam</Text>
              <Text className="text-[13px] font-semibold text-text">{formatDate(item.tanggal)}</Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-[11px] text-text-muted">Tanggal kembali</Text>
            <Text className="text-[13px] font-semibold text-text">
              {formatDate(item.tanggal_kembali)}
            </Text>
          </View>
        </View>

        <View className="mt-3 h-px bg-border/60" />

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="mr-2 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tone.dot }}
            />
            <Text className="text-[12px] text-text-muted">Status pinjaman</Text>
          </View>
          <Text className={`text-[12px] font-semibold ${tone.text}`}>{item.status}</Text>
        </View>
      </View>
    </View>
  );
}

export default function PinjamScreen() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.pinjam);
  const { user } = useAppSelector((state) => state.auth);

  const loadPinjams = useCallback(() => {
    dispatch(fetchPinjams());
  }, [dispatch]);

  useEffect(() => {
    loadPinjams();
  }, [loadPinjams]);

  const handleRefresh = useCallback(() => {
    dispatch(clearPinjamError());
    loadPinjams();
  }, [dispatch, loadPinjams]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;

        if (item.status.trim().toLowerCase() === 'belum dikembalikan') {
          acc.active += 1;
        }

        if (item.status.trim().toLowerCase() === 'dikembalikan') {
          acc.returned += 1;
        }

        return acc;
      },
      { total: 0, active: 0, returned: 0 }
    );
  }, [items]);

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View className="mt-16 items-center px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
          <Feather name="inbox" size={24} color="#7a8a80" />
        </View>
        <Text className="mt-4 text-[17px] font-semibold text-text">Belum ada riwayat pinjam</Text>
        <Text className="mt-1 text-center text-[13px] leading-5 text-text-muted">
          Riwayat peminjaman barang akan muncul di halaman ini setelah transaksi dibuat.
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="px-5">
            <LoanCard item={item} />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View className="px-5 pb-5 pt-3">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-[24px] font-bold text-text">Pinjam</Text>
                <Text className="text-[13px] leading-5 text-text-muted">
                  Riwayat peminjaman barang laboratorium untuk {user?.nama || 'pengguna'}.
                </Text>
              </View>

              <View className="rounded-lg bg-primary px-4 py-3">
                <Text className="text-[20px] font-bold text-white">{summary.total}</Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <SummaryCard icon="clock" label="Sedang dipinjam" value={summary.active} />
              <SummaryCard icon="check-circle" label="Sudah kembali" value={summary.returned} />
            </View>

            {error ? (
              <View className="mt-4 rounded-lgl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-[13px] leading-5 text-rose-700">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={<View className="h-6" />}
        contentContainerStyle={{
          paddingBottom: 24,
          flexGrow: items.length === 0 ? 1 : undefined,
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && items.length === 0 ? (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color="#006569" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
