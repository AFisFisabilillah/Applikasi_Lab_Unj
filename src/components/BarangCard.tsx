import { memo } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Barang } from '@/types/Barang';

type BarangCardProps = {
  barang: Barang;
  onPress?: () => void;
};

function getStockLabel(jumlah: number) {
  if (jumlah <= 0) return { bg: 'bg-rose-100', text: 'text-rose-700' };
  if (jumlah <= 3) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-slate-100', text: 'text-slate-500' };
}

function BarangCardComponent({ barang, onPress }: BarangCardProps) {
  const avail = barang.available
      ? { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tersedia' }
      : { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Dipinjam' };

  const stock = getStockLabel(barang.jumlah);

  return (
      <Pressable
          onPress={onPress}
          className="overflow-hidden rounded-2xl border border-border/60 bg-white active:opacity-90"
      >
        <View className="h-32 w-full bg-surface-muted">
          {barang.gambar_url ? (
              <Image
                  source={{ uri: barang.gambar_url }}
                  className="h-full w-full"
                  contentFit="cover"
              />
          ) : (
              <View className="flex-1 items-center justify-center">
                <Feather name="package" size={32} color="#9ca3af" />
              </View>
          )}
          <View className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 ${avail.bg}`}>
            <Text className={`text-[10px] font-semibold ${avail.text}`}>
              {avail.label}
            </Text>
          </View>
        </View>

        <View className="px-3 pt-2.5 pb-0">
          <Text
              className="text-[13px] font-semibold leading-snug text-text"
              numberOfLines={2}
          >
            {barang.nama}
          </Text>
          <Text className="mt-0.5 text-[10px] uppercase tracking-wide text-text-muted">
            {barang.kode_barang}
          </Text>
          <View className={`mt-2 self-start rounded-full px-2 py-0.5 ${stock.bg}`}>
            <Text className={`text-[10px] font-medium ${stock.text}`}>
              Stok {barang.jumlah} unit
            </Text>
          </View>
        </View>

        <View className="mt-3 px-3 pb-3">
          <View className="flex-row items-center justify-center gap-1 rounded-xl bg-primary py-2">
            <Text className="text-[12px] font-semibold text-white">Detail</Text>
            <Feather name="arrow-right" size={12} color="#fff" />
          </View>
        </View>
      </Pressable>
  );
}

export const BarangCard = memo(BarangCardComponent);