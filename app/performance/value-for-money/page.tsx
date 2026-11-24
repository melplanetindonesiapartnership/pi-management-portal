import type { Metadata } from "next";
import TopNav from "../../components/TopNav";
import { VFM_URL } from "../../lib/links";

export const metadata: Metadata = {
  title: "Value for Money Mitra YPI · Planet Indonesia",
};

// Dashboard live dari web app Apps Script (data dihitung dari Google Sheet setiap dibuka).
// Akses dibatasi domain planetindonesia.org. Google tidak mengizinkan halaman login tampil di iframe,
// jadi dashboard hanya muncul bila browser sudah login akun Google YPI.
export default function ValueForMoneyPage() {
  return (
    <main className="flex h-screen flex-col bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <iframe
        src={VFM_URL}
        title="Value for Money Mitra YPI"
        className="w-full flex-1 border-0"
      />
    </main>
  );
}
