import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BarangCard } from '@/components/BarangCard';
import { BarangDetailSheet } from '@/components/BarangDetailSheet';
import { clearBarangError, fetchBarang } from '@/slice/barangSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Barang } from '@/types/Barang';

const INITIAL_PAGE_SIZE = 20;
const TAB_BAR_SPACING = 108;

export default function BarangScreen() {
    const dispatch = useAppDispatch();
    const { items, meta, isLoading, isLoadingMore, error } = useAppSelector((state) => state.barang);
    const insets = useSafeAreaInsets();

    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

    // Ref guard: di-set TRUE secara synchronous begitu fetch dimulai,
    // jadi onEndReached yang terpanggil berkali-kali dalam waktu singkat
    // tidak akan lolos cek ini meski Redux state belum sempat update.
    const isFetchingNextPageRef = useRef(false);
    const lastRequestedPageRef = useRef(0);

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
        // reset guard setiap kali query berubah (halaman 1 dimuat ulang)
        isFetchingNextPageRef.current = false;
        lastRequestedPageRef.current = 0;
        loadBarang(1, searchQuery, INITIAL_PAGE_SIZE);
    }, [loadBarang, searchQuery]);

    // Begitu isLoadingMore dari Redux benar2 false (fetch selesai/gagal),
    // baru lepas guard supaya scroll selanjutnya bisa trigger load lagi.
    useEffect(() => {
        if (!isLoadingMore) {
            isFetchingNextPageRef.current = false;
        }
    }, [isLoadingMore]);

    const handleRefresh = useCallback(() => {
        dispatch(clearBarangError());
        isFetchingNextPageRef.current = false;
        lastRequestedPageRef.current = 0;
        loadBarang(1, searchQuery, INITIAL_PAGE_SIZE);
    }, [dispatch, loadBarang, searchQuery]);

    const handleLoadMore = useCallback(() => {
        if (isLoading || !meta) {
            return;
        }

        if (meta.current_page >= meta.last_page) {
            return;
        }

        const nextPage = meta.current_page + 1;

        // Guard ganda: ref (synchronous) + cek halaman yang sama belum diminta
        if (isFetchingNextPageRef.current || lastRequestedPageRef.current === nextPage) {
            return;
        }

        isFetchingNextPageRef.current = true;
        lastRequestedPageRef.current = nextPage;

        loadBarang(nextPage, searchQuery, INITIAL_PAGE_SIZE);
    }, [isLoading, loadBarang, meta, searchQuery]);

    const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
        return (
            <View style={{ flex: 1 }}>
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
                    backgroundColor: 'white',
                    borderBottomWidth: isScrolled ? 1 : 0,
                    borderBottomColor: isScrolled ? '#e5e7eb' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: isScrolled ? 2 : 0 },
                    shadowOpacity: isScrolled ? 0.06 : 0,
                    shadowRadius: 8,
                    elevation: isScrolled ? 3 : 0,
                }}
            >
                {!isScrolled && (
                    <View className="mb-3">
                        <Text className="text-[24px] font-bold text-text">Daftar Barang</Text>
                        <Text className="text-[13px] leading-5 text-text-muted">
                            Cari alat laboratorium yang tersedia untuk diajukan peminjaman.
                        </Text>
                    </View>
                )}

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
                onEndReachedThreshold={0.5}
                onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 10)}
                scrollEventThrottle={16}
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
                    paddingTop: 4,
                }}
                ItemSeparatorComponent={() => <View className="h-1.5" />}
                showsVerticalScrollIndicator={false}
                // --- props tambahan supaya infinite scroll lebih smooth ---
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={11}
                removeClippedSubviews={Platform.OS === 'android'}
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