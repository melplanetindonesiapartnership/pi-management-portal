import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Hanya akun Google Workspace Yayasan Planet Indonesia yang boleh masuk portal.
const ALLOWED_DOMAIN = "planetindonesia.org";

// Kredensial dibaca otomatis dari env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      // hd: Google langsung menawarkan akun domain YPI; tetap diperiksa lagi di callback signIn.
      authorization: { params: { hd: ALLOWED_DOMAIN, prompt: "select_account" } },
    }),
  ],
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
    // Dipakai proxy.ts: tanpa sesi, pengunjung diarahkan ke /login.
    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
  },
});
