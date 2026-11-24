import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Hanya akun Google Workspace Yayasan Planet Indonesia yang boleh masuk portal.
const ALLOWED_DOMAIN = "planetindonesia.org";

// Sesi berlaku 24 jam sejak login, tidak diperpanjang oleh aktivitas; setelah itu login ulang (otomatis bila browser masih login Google).
const SESSION_SECONDS = 24 * 60 * 60;

// Kredensial dibaca otomatis dari env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      // hd: Google langsung memakai akun domain YPI yang sudah login di browser, tanpa layar pilih akun.
      // Domain tetap diperiksa lagi di callback signIn.
      authorization: { params: { hd: ALLOWED_DOMAIN } },
    }),
  ],
  session: { strategy: "jwt", maxAge: SESSION_SECONDS },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn({ account, profile }) {
      return (
        account?.provider === "google" &&
        profile?.email_verified === true &&
        profile?.hd === ALLOWED_DOMAIN &&
        typeof profile.email === "string" &&
        profile.email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
      );
    },
    // Waktu login dicatat sekali; account hanya ada pada saat login.
    jwt({ token, account }) {
      if (account) token.loginAt = Date.now();
      return token;
    },
    session({ session, token }) {
      return { ...session, loginAt: token.loginAt };
    },
    // Dipakai proxy.ts: tanpa sesi, atau sesi lebih dari 24 jam, pengunjung diarahkan ke /login.
    authorized({ auth: session }) {
      const loginAt = (session as { loginAt?: unknown } | null)?.loginAt;
      return (
        Boolean(session?.user) &&
        typeof loginAt === "number" &&
        Date.now() - loginAt < SESSION_SECONDS * 1000
      );
    },
  },
});
