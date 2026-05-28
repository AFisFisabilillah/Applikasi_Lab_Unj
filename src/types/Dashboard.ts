export interface DashboardLoanItem {
  id: number;
  user_id: number;
  admin_id: number | null;
  tanggal: string;
  tanggal_kembali: string | null;
  fakultas: string;
  prodi: string;
  nim_nip: string;
  type_user: string;
  kode_barang: string;
  nama_barang: string;
  status: string;
  foto_terakhir: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardBarangTersediaItem {
  id: number;
  kode_barang: string;
  nama: string;
  jumlah: number;
  created_at: string;
  updated_at: string;
  gambar: string | null;
  deskripsi: string | null;
}

export type DashboardLoanSummary = Record<string, number>;

export interface DashboardData {
  loan: DashboardLoanSummary;
  allLoan: number;
  loanActive: DashboardLoanItem[];
  barangTersedia: DashboardBarangTersediaItem[];
  loanRecent: DashboardLoanItem[];
}
