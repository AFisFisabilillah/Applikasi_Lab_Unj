import { memo } from 'react';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { Barang } from '@/types/Barang';

type BarangCardProps = {
  barang: Barang;
};

function BarangCardComponent({ barang }: BarangCardProps) {
  return (
    <View className="rounded-2xl border border-border/70 bg-surface px-4 py-4 shadow-sm">
      <View className="flex-row gap-4">
        <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
          {barang.gambar_url ? (
            <Image
              source={{ uri: barang.gambar_url }}
              className="h-full w-full"
              contentFit="cover"
            />
          ) : (
            <Feather name="package" size={26} color="#8c9a91" />
          )}
        </View>

        <View className="flex-1 justify-between">
          <View className="gap-2">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-[16px] font-semibold leading-5 text-text">
                {barang.nama}
              </Text>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  barang.available ? 'bg-emerald-50' : 'bg-rose-50'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    barang.available ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {barang.available ? 'Tersedia' : 'Dipinjam'}
                </Text>
              </View>
            </View>

            <Text className="text-[12px] font-medium uppercase tracking-[0.6px] text-text-muted">
              {barang.kode_barang}
            </Text>

            <Text className="text-[13px] leading-5 text-text-muted" numberOfLines={3}>
              {barang.deskripsi?.replace(/\r\n/g, '\n') || 'Tidak ada deskripsi.'}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Feather name="layers" size={15} color="#006569" />
              </View>
              <View>
                <Text className="text-[11px] text-text-muted">Stok</Text>
                <Text className="text-[14px] font-semibold text-text">{barang.jumlah} unit</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export const BarangCard = memo(BarangCardComponent);
