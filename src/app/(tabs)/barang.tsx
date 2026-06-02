import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BarangCard } from '@/components/BarangCard';
import { BarangDetailSheet } from '@/components/BarangDetailSheet';
import { clearBarangError, fetchBarang } from '@/slice/barangSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Barang } from '@/types/Barang';

const INITIAL_PAGE_SIZE = 10;
const TAB_BAR_SPACING = 108;

export default function BarangScreen() {
  const dispatch = useAppDispatch();
  const { items, meta, isLoading, isLoadingMore, error } = useAppSelector((state) => state.barang);
  const insets = useSafeAreaInsets();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadBarang = useCallback(
    (page: number, search: string, size = INITIAL_PAGE_SIZE) => {
      dispatch(fetchBarang({ page, search, size }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadBarang(1, searchQuery, INITIAL_PAGE_SIZE);
  }, [loadBarang, searchQuery]);

  const handleRefresh = useCallback(() => {
    dispatch(clearBarangError());
    loadBarang(1, searchQuery, INITIAL_PAGE_SIZE);
  }, [dispatch, loadBarang, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !meta) {
      return;
    }

    if (meta.current_page >= meta.last_page) {
      return;
    }

    loadBarang(meta.current_page + 1, searchQuery, INITIAL_PAGE_SIZE);
  }, [isLoading, isLoadingMore, loadBarang, meta, searchQuery]);

  const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
    return (
      <View style={{ width: '48%' }}>
        <BarangCard barang={item} onPress={() => setSelectedBarang(item)} />
      </View>
    );
  }, []);

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View className="mt-14 items-center px-6">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Feather name="search" size={22} color="#7a8a80" />
        </View>
        <Text className="mt-4 text-[17px] font-semibold text-text">Barang tidak ditemukan</Text>
        <Text className="mt-1 text-center text-[13px] leading-5 text-text-muted">
          Coba kata kunci lain untuk melihat daftar barang laboratorium.
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        className="px-1"
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View className="px-5 pb-4 pt-3">
            <View className="gap-1">
              <Text className="text-[24px] font-bold text-text">Daftar Barang</Text>
              <Text className="text-[13px] leading-5 text-text-muted">
                Cari alat laboratorium yang tersedia untuk diajukan peminjaman.
              </Text>
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3">
              <Feather name="search" size={18} color="#7a8a80" />
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari nama atau kode barang"
                placeholderTextColor="#aab4ad"
                autoCapitalize="characters"
                className="ml-3 flex-1 p-0 text-[14px] text-text"
                returnKeyType="search"
              />
              {searchInput.length > 0 ? (
                <Pressable onPress={() => setSearchInput('')} hitSlop={10}>
                  <Feather name="x-circle" size={18} color="#7a8a80" />
                </Pressable>
              ) : null}
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-[12px] font-medium text-text-muted">
                {meta?.total ?? items.length} barang
              </Text>
              <Text className="text-[12px] font-medium text-text-muted">
                Muat {INITIAL_PAGE_SIZE} per halaman
              </Text>
            </View>

            {error ? (
              <View className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-[13px] leading-5 text-rose-700">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#006569" />
            </View>
          ) : (
            <View className="h-6" />
          )
        }
        contentContainerStyle={{
          paddingBottom: TAB_BAR_SPACING + insets.bottom,
          flexGrow: items.length === 0 ? 1 : undefined,
          paddingHorizontal: 4,
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && items.length === 0 ? (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color="#006569" />
        </View>
      ) : null}

      <BarangDetailSheet
        barang={selectedBarang}
        visible={selectedBarang !== null}
        onClose={() => setSelectedBarang(null)}
      />
    </SafeAreaView>
  );
}
