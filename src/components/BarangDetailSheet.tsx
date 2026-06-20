import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Barang } from '@/types/Barang';

type BarangDetailSheetProps = {
  barang: Barang | null;
  visible: boolean;
  onClose: () => void;
};

const IMAGE_HEIGHT = 300;

const GRADIENT_COLORS = ['transparent', 'rgba(0,0,0,0.14)', 'rgba(0,0,0,0.78)'] as const;
const GRADIENT_LOCATIONS = [0.15, 0.55, 1] as const;
const GRADIENT_START = { x: 0.5, y: 0 };
const GRADIENT_END = { x: 0.5, y: 1 };
const GRADIENT_STYLE = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };
const DETAIL_IMAGE_STYLE = { width: '100%' as const, height: IMAGE_HEIGHT };

const DetailRow = memo(function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-surface-muted px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Feather name={icon} size={16} color="#006569" />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
          {label}
        </Text>
        <Text className="mt-1 text-[14px] leading-5 text-text">{value}</Text>
      </View>
    </View>
  );
});

export function BarangDetailSheet({ barang, visible, onClose }: BarangDetailSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);
  const snapPoints = useMemo(() => ['70%', '92%'], []);
  const description = useMemo(
    () => barang?.deskripsi?.replace(/\r\n/g, '\n') || 'Tidak ada deskripsi.',
    [barang?.deskripsi]
  );
  const updatedAt = useMemo(
    () => (barang ? new Date(barang.updated_at).toLocaleString('id-ID') : '-'),
    [barang]
  );

  useEffect(() => {
    if (visible && barang) {
      hasPresentedRef.current = true;
      bottomSheetRef.current?.present();
      return;
    }

    if (hasPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [barang, visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      handleIndicatorStyle={{ backgroundColor: '#c6d0c8', width: 56 }}
      backgroundStyle={{ backgroundColor: '#ffffff' }}
    >
      <SafeAreaView edges={['bottom']} className="flex-1 bg-surface">
        {barang ? (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="relative overflow-hidden rounded-t-[28px] bg-surface-muted">
              {barang.gambar_url ? (
                <Image
                  source={{ uri: barang.gambar_url }}
                  style={DETAIL_IMAGE_STYLE}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  priority="high"
                />
              ) : (
                <View className="h-[300px] items-center justify-center">
                  <Feather name="package" size={40} color="#8c9a91" />
                </View>
              )}

              <LinearGradient
                colors={GRADIENT_COLORS}
                locations={GRADIENT_LOCATIONS}
                start={GRADIENT_START}
                end={GRADIENT_END}
                style={GRADIENT_STYLE}
              />

              <Pressable
                onPress={() => bottomSheetRef.current?.dismiss()}
                className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/35"
                hitSlop={10}
              >
                <Feather name="x" size={18} color="#ffffff" />
              </Pressable>

              <View className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10">
                <Text className="text-[24px] font-bold leading-8 text-white">{barang.nama}</Text>
                <Text className="mt-1 text-[12px] font-semibold uppercase tracking-[0.9px] text-white/80">
                  {barang.kode_barang}
                </Text>
              </View>
            </View>

            <View className="px-5 pt-5">
              <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-surface-muted px-4 py-3">
                <View className="flex-1 pr-3">
                  <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                    Status
                  </Text>
                  <Text className="mt-1 text-[15px] font-semibold text-text">
                    {barang.available ? 'Tersedia untuk dipinjam' : 'Sedang tidak tersedia'}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1.5 ${
                    barang.available ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      barang.available ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {barang.available ? 'Tersedia' : 'Dipinjam'}
                  </Text>
                </View>
              </View>

              <View className="mt-4 gap-3">
                <DetailRow icon="layers" label="Jumlah" value={`${barang.jumlah} unit`} />
                <DetailRow icon="file-text" label="Deskripsi" value={description} />
                <DetailRow icon="clock" label="Diperbarui" value={updatedAt} />
              </View>
            </View>
          </BottomSheetScrollView>
        ) : null}
      </SafeAreaView>
    </BottomSheetModal>
  );
}
