// Semua halaman, API, dan tool statis di public/ wajib login akun YPI (lihat callback authorized di auth.ts).
export { auth as proxy } from "./auth";

export const config = {
  // Dikecualikan: endpoint Auth.js, halaman login, aset build Next, dan gambar yang dipakai halaman login.
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|icon.png|pi-logo-white.png).*)",
  ],
};
