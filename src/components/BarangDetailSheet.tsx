import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image } from 'expo-image';
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

function DetailRow({
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
}

export function BarangDetailSheet({ barang, visible, onClose }: BarangDetailSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%', '92%'], []);

  useEffect(() => {
    if (visible && barang) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [barang, visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!barang) {
    return null;
  }

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
        <View className="px-5 pb-3 pt-1">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[22px] font-bold leading-7 text-text">{barang.nama}</Text>
              <Text className="mt-1 text-[13px] font-medium uppercase tracking-[0.7px] text-text-muted">
                {barang.kode_barang}
              </Text>
            </View>

            <Pressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
              hitSlop={10}
            >
              <Feather name="x" size={18} color="#415046" />
            </Pressable>
          </View>
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        >
          <View className="overflow-hidden rounded-3xl bg-surface-muted">
            {barang.gambar_url ? (
              <Image
                source={{ uri: barang.gambar_url }}
                style={{ width: '100%', height: 220 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-[220px] items-center justify-center">
                <Feather name="package" size={34} color="#8c9a91" />
              </View>
            )}
          </View>

          <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-border/70 bg-surface-muted px-4 py-3">
            <View>
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
            <DetailRow
              icon="file-text"
              label="Deskripsi"
              value={barang.deskripsi?.replace(/\r\n/g, '\n') || 'Tidak ada deskripsi.'}
            />
            <DetailRow
              icon="clock"
              label="Diperbarui"
              value={new Date(barang.updated_at).toLocaleString('id-ID')}
            />
          </View>
        </BottomSheetScrollView>
      </SafeAreaView>
    </BottomSheetModal>
  );
}
