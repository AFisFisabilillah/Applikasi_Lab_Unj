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

  const [isScrolled, setIsScrolled] = useState(false);
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
      <View style={{ flex:1 }}>
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
      <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: 'white', // atau token bg-background kamu
            borderBottomWidth: isScrolled ? 1 : 0,
            borderBottomColor: isScrolled ? '#e5e7eb' : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isScrolled ? 2 : 0 },
            shadowOpacity: isScrolled ? 0.06 : 0,
            shadowRadius: 8,
            elevation: isScrolled ? 3 : 0,
          }}
      >
        {/* Judul — sembunyikan saat scroll */}
        {!isScrolled && (
            <View className="mb-3">
              <Text className="text-[24px] font-bold text-text">Daftar Barang</Text>
              <Text className="text-[13px] leading-5 text-text-muted">
                Cari alat laboratorium yang tersedia untuk diajukan peminjaman.
              </Text>
            </View>
        )}

        {/* Search bar */}
        <View className="flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3">
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
          {searchInput.length > 0 && (
              <Pressable onPress={() => setSearchInput('')} hitSlop={10}>
                <Feather name="x-circle" size={18} color="#7a8a80" />
              </Pressable>
          )}
        </View>

        <Text className="mt-2 text-[12px] font-medium text-text-muted">
          {meta?.total ?? items.length} barang
        </Text>
      </View>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        className=""
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 10)}
        columnWrapperStyle={{ gap: 5 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}

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
        ItemSeparatorComponent={() => <View className="h-1.5" />}
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
