export interface User {
  id: number;
  nama: string;
  email: string;
  nim_nip: string;
  fakultas: string;
  prodi: string;
  type_user: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}
