"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

// Langsung lanjut ke Google begitu halaman login terbuka. Bila browser sudah login akun YPI,
// Google mengembalikan pengguna tanpa layar tambahan. Tidak dipakai saat ada error, supaya tidak berputar.
export default function AutoSignIn({ redirectTo }: { redirectTo: string }) {
  useEffect(() => {
    void signIn("google", { redirectTo });
  }, [redirectTo]);

  return (
    <p className="mt-5 text-sm text-white/75" role="status">
      Menghubungkan ke akun Google YPI…
    </p>
  );
}
