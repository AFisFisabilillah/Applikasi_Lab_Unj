import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { BottomSheetBackdrop, BottomSheetModal, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { isAxiosError } from 'axios';

import api from '@/axiosInstance';
import type { Barang } from '@/types/Barang';

const ACCESS_CAMERA_IMAGE = require('../../../assets/acces_camera.svg');

type PinjamResponse = {
  success?: boolean;
  succes?: boolean;
  message: string;
  data?: {
    id: number;
    kode_barang: string;
    nama_barang: string;
    status: string;
    tanggal: string;
    barang?: {
      gambar_url?: string | null;
      available?: boolean;
    };
  };
  errors?: unknown;
};

type ScanResultState = {
  type: 'success' | 'error';
  message: string;
  kodeBarang: string;
  loan?: PinjamResponse['data'];
};

type BarangByKodeResponse = {
  success: boolean;
  message: string;
  data: Barang;
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isFetchingBarang, setIsFetchingBarang] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null);
  const [scannedBarang, setScannedBarang] = useState<Barang | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const confirmSheetRef = useRef<BottomSheetModal>(null);
  const resultSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['52%'], []);
  const confirmSnapPoints = useMemo(() => ['92%'], []);
  const resultSnapPoints = useMemo(() => ['70%'], []);

  useEffect(() => {
    if (!permission) {
      return;
    }

    if (!permission.granted && !permission.canAskAgain) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [permission, requestPermission]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.35} />
    ),
    []
  );

  const handleResetScan = useCallback(() => {
    setHasScanned(false);
    setScannedValue(null);
    setIsFetchingBarang(false);
    setIsSubmitting(false);
    setScanResult(null);
    setScannedBarang(null);
  }, []);

  const presentErrorResult = useCallback((message: string, kodeBarang: string) => {
    setScanResult({
      type: 'error',
      message,
      kodeBarang,
    });
    resultSheetRef.current?.present();
  }, []);

  const fetchBarangByKode = useCallback(async (kodeBarang: string) => {
    setIsFetchingBarang(true);

    try {
      const response = await api.get<BarangByKodeResponse>(`/barang/kode/${kodeBarang}`);

      setScannedBarang(response.data.data);
      confirmSheetRef.current?.present();
    } catch (error) {
      let message = 'Gagal mengambil detail barang. Silakan coba lagi.';

      if (isAxiosError<PinjamResponse>(error)) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
          message = apiMessage;
        }
      } else if (error instanceof Error && error.message.trim()) {
        message = error.message;
      }

      presentErrorResult(message, kodeBarang);
    } finally {
      setIsFetchingBarang(false);
    }
  }, [presentErrorResult]);

  const submitPinjam = useCallback(async (kodeBarang: string) => {
    setIsSubmitting(true);

    try {
      const response = await api.post<PinjamResponse>('/pinjam', {
        kode_barang: kodeBarang,
      });

      confirmSheetRef.current?.dismiss();
      setScanResult({
        type: 'success',
        message: response.data.message || 'Peminjaman berhasil dibuat.',
        kodeBarang,
        loan: response.data.data,
      });
      resultSheetRef.current?.present();
    } catch (error) {
      let message = 'Gagal membuat peminjaman. Silakan coba lagi.';

      if (isAxiosError<PinjamResponse>(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;

        if (status === 404) {
          message = apiMessage || 'Barang tidak di temukan';
        } else if (status === 422) {
          message = apiMessage || 'Stok Habis';
        } else if (typeof apiMessage === 'string' && apiMessage.trim()) {
          message = apiMessage;
        }
      } else if (error instanceof Error && error.message.trim()) {
        message = error.message;
      }

      presentErrorResult(message, kodeBarang);
    } finally {
      setIsSubmitting(false);
    }
  }, [presentErrorResult]);

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (hasScanned || isSubmitting || isFetchingBarang) {
      return;
    }

    const kodeBarang = result.data.trim();
    setHasScanned(true);
    setScannedValue(kodeBarang);
    void fetchBarangByKode(kodeBarang);
  }, [fetchBarangByKode, hasScanned, isFetchingBarang, isSubmitting]);

  const handleRequestAccess = useCallback(async () => {
    setIsRequestingPermission(true);

    if (permission?.canAskAgain) {
      await requestPermission();
      setIsRequestingPermission(false);
      return;
    }

    await Linking.openSettings();
    setIsRequestingPermission(false);
  }, [permission?.canAskAgain, requestPermission]);

  const cameraGranted = permission?.granted ?? false;
  const isCheckingPermission = permission === null;
  const isBusy = isFetchingBarang || isSubmitting;
  const handleCloseResultSheet = useCallback(() => {
    resultSheetRef.current?.dismiss();
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pb-4 pt-3">
        <Text className="text-[24px] font-bold text-text">Scan QR Barang</Text>
        <Text className="mt-1 text-[13px] leading-5 text-text-muted">
          Arahkan kamera ke QR code barang untuk membaca identitas barang dengan cepat.
        </Text>
      </View>

      <View className="px-5 pb-6">
        <View className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-sm">
          <View style={styles.cameraContainer}>
            {cameraGranted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                active
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarcodeScanned}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-surface-muted px-8">
                {isCheckingPermission ? (
                  <>
                    <ActivityIndicator size="small" color="#006569" />
                    <Text className="mt-4 text-center text-[14px] text-text-muted">
                      Memeriksa izin kamera...
                    </Text>
                  </>
                ) : (
                  <>
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Feather name="camera-off" size={28} color="#006569" />
                    </View>
                    <Text className="mt-4 text-center text-[18px] font-semibold text-text">
                      Kamera belum tersedia
                    </Text>
                    <Text className="mt-2 text-center text-[13px] leading-5 text-text-muted">
                      Izinkan akses kamera untuk mulai memindai QR code barang.
                    </Text>
                    <Pressable
                      onPress={handleRequestAccess}
                      disabled={isRequestingPermission}
                      className="mt-5 h-11 min-w-[152px] items-center justify-center rounded-2xl bg-primary px-5 active:opacity-90"
                    >
                      {isRequestingPermission ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="text-[14px] font-semibold text-white">
                          Izinkan Kamera
                        </Text>
                      )}
                    </Pressable>
                  </>
                )}
              </View>
            )}

            <View className="pointer-events-none absolute inset-0 items-center justify-center">
              <View className="h-64 w-64 rounded-[28px] border-2 border-white/90" />
            </View>
          </View>

          <View className="px-4 py-4">
            <View>
              <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                {isBusy ? 'Memproses' : 'Hasil Scan'}
              </Text>
              <Text className="mt-1 text-[15px] leading-6 text-text">
                {isFetchingBarang
                  ? `Mengambil detail barang untuk ${scannedValue ?? 'kode barang'}...`
                  : isSubmitting
                  ? `Memproses peminjaman untuk ${scannedValue ?? 'kode barang'}...`
                  : scannedValue || 'Belum ada QR code yang terbaca.'}
              </Text>
            </View>

            <Pressable
              onPress={handleResetScan}
              disabled={isBusy}
              className={`mt-4 h-14 w-full flex-row items-center justify-center rounded-lg active:opacity-90 ${
                isBusy ? 'bg-primary/50' : 'bg-primary'
              }`}
            >
              <Feather name="refresh-cw" size={18} color="#ffffff" />
              <Text className="ml-2 text-[15px] font-semibold text-white">Scan Ulang</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ backgroundColor: '#c6d0c8', width: 56 }}
        backgroundStyle={{ backgroundColor: '#ffffff' }}
      >
        <View className="px-5 pb-8 pt-2">
          <View className="items-center">
            <Image
              source={ACCESS_CAMERA_IMAGE}
              style={{ width: 220, height: 160 }}
              contentFit="contain"
            />
          </View>

          <Text className="mt-5 text-center text-[22px] font-bold text-text">
            Izinkan Akses Kamera
          </Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-text-muted">
            Aplikasi memerlukan akses kamera untuk memindai QR code barang. Aktifkan izin kamera
            agar fitur scan dapat digunakan.
          </Text>

          <Pressable
            onPress={handleRequestAccess}
            disabled={isRequestingPermission}
            className="mt-6 h-12 items-center justify-center rounded-2xl bg-primary active:opacity-90"
          >
            {isRequestingPermission ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-[15px] font-semibold text-white">
                {permission?.canAskAgain ? 'Izinkan Kamera' : 'Buka Pengaturan'}
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        ref={confirmSheetRef}
        snapPoints={confirmSnapPoints}
        onDismiss={() => {
          if (!isSubmitting) {
            setScannedBarang(null);
          }
        }}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ backgroundColor: '#c6d0c8', width: 56 }}
        backgroundStyle={{ backgroundColor: '#ffffff' }}
      >
        <SafeAreaView edges={['bottom']} className="flex-1 bg-surface">
          <View className="px-5 pb-8 pt-2">
            <Text className="text-[22px] font-bold text-text">Konfirmasi Peminjaman</Text>
            <Text className="mt-2 text-[13px] leading-5 text-text-muted">
              Periksa detail barang sebelum membuat peminjaman.
            </Text>

            <View className="mt-5 overflow-hidden rounded-3xl bg-surface-muted">
              {scannedBarang?.gambar_url ? (
                <Image
                  source={{ uri: scannedBarang.gambar_url }}
                  style={{ width: '100%', height: 220 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-[220px] items-center justify-center">
                  <Feather name="package" size={36} color="#8c9a91" />
                </View>
              )}
            </View>

            <View className="mt-4 gap-3 rounded-3xl bg-surface-muted px-4 py-4">
              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                  Kode Barang
                </Text>
                <Text className="mt-1 text-[15px] font-semibold text-text">
                  {scannedBarang?.kode_barang ?? '-'}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                  Nama Barang
                </Text>
                <Text className="mt-1 text-[15px] leading-6 text-text">
                  {scannedBarang?.nama ?? '-'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                    Jumlah
                  </Text>
                  <Text className="mt-1 text-[15px] leading-6 text-text">
                    {scannedBarang ? `${scannedBarang.jumlah} unit` : '-'}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1.5 ${
                    scannedBarang?.available ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      scannedBarang?.available ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {scannedBarang?.available ? 'Tersedia' : 'Tidak tersedia'}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                  Deskripsi
                </Text>
                <Text className="mt-1 text-[15px] leading-6 text-text">
                  {scannedBarang?.deskripsi || 'Tidak ada deskripsi.'}
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={() => {
                  confirmSheetRef.current?.dismiss();
                  handleResetScan();
                }}
                disabled={isSubmitting}
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-surface-muted active:opacity-90"
              >
                <Text className="text-[14px] font-semibold text-text">Batal</Text>
              </Pressable>
              {
                scannedBarang?.available &&
                  <Pressable
                      onPress={() => {
                        if (scannedValue) {
                          void submitPinjam(scannedValue);
                        }
                      }}
                      disabled={isSubmitting || !scannedBarang}
                      className={`h-12 flex-1 items-center justify-center rounded-2xl active:opacity-90 ${
                          isSubmitting || !scannedBarang ? 'bg-primary/50' : 'bg-primary'
                      }`}
                  >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text className="text-[14px] font-semibold text-white">Konfirmasi Pinjam</Text>
                    )}
                  </Pressable>
              }

            </View>
          </View>
        </SafeAreaView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={resultSheetRef}
        snapPoints={resultSnapPoints}
        onDismiss={() => setScanResult(null)}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ backgroundColor: '#c6d0c8', width: 56 }}
        backgroundStyle={{ backgroundColor: '#ffffff' }}
      >
        <SafeAreaView edges={['bottom']} className="bg-surface">
          <View className="px-5 pb-8 pt-2">
            <View
              className={`h-14 w-14 items-center justify-center rounded-full ${
                scanResult?.type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'
              }`}
            >
              <Feather
                name={scanResult?.type === 'success' ? 'check' : 'x'}
                size={24}
                color={scanResult?.type === 'success' ? '#15803d' : '#be123c'}
              />
            </View>

            <Text className="mt-5 text-[22px] font-bold text-text">
              {scanResult?.type === 'success' ? 'Peminjaman Berhasil' : 'Peminjaman Gagal'}
            </Text>
            <Text className="mt-2 text-[14px] leading-6 text-text-muted">
              {scanResult?.message}
            </Text>

            <View className="mt-5 gap-3 rounded-3xl bg-surface-muted px-4 py-4">
              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                  Kode Barang
                </Text>
                <Text className="mt-1 text-[15px] font-semibold text-text">
                  {scanResult?.loan?.kode_barang ?? scanResult?.kodeBarang}
                </Text>
              </View>

              {scanResult?.loan?.nama_barang ? (
                <View>
                  <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                    Nama Barang
                  </Text>
                  <Text className="mt-1 text-[15px] leading-6 text-text">
                    {scanResult.loan.nama_barang}
                  </Text>
                </View>
              ) : null}

              {scanResult?.loan?.status ? (
                <View>
                  <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-text-muted">
                    Status
                  </Text>
                  <Text className="mt-1 text-[15px] leading-6 text-text">
                    {scanResult.loan.status}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={handleCloseResultSheet}
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-surface-muted active:opacity-90"
              >
                <Text className="text-[14px] font-semibold text-text">Tutup</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleCloseResultSheet();
                  handleResetScan();
                }}
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-primary active:opacity-90"
              >
                <Text className="text-[14px] font-semibold text-white">Scan Lagi</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    position: 'relative',
    minHeight: 420,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
});
