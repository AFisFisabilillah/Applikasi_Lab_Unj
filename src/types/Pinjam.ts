import type { Barang } from '@/types/Barang';

export interface Pinjam {
  id: number;
  user_id: number;
  kode_barang: string;
  barang_id: number;
  nama_barang: string;
  status: string;
  nim_nip: string;
  fakultas: string;
  prodi: string;
  type_user: string;
  foto_terakhir: string | null;
  foto_terakhir_url: string | null;
  tanggal: string;
  tanggal_kembali: string | null;
  created_at: string;
  updated_at: string;
  barang: Barang;
}
