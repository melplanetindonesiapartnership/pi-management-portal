import type { Metadata } from "next";
import Image from "next/image";
import { signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Masuk · Planet Indonesia",
};

// Tujuan setelah login: hanya path-nya yang dipakai (origin dibuang, garis miring ganda dirapikan),
// jadi callbackUrl tidak bisa mengarahkan ke situs lain.
function safePath(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return "/";
  try {
    const url = new URL(v, "http://portal.local");
    return url.pathname.replace(/^\/+/, "/") + url.search + url.hash;
  } catch {
    return "/";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectTo = safePath(params.callbackUrl);
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  async function masuk() {
    "use server";
    await signIn("google", { redirectTo });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F0EC] px-6 py-12 text-[#004B5C]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[#004B5C] text-white shadow-sm">
        <div className="px-8 pb-10 pt-8">
          <Image src="/pi-logo-white.png" alt="Yayasan Planet Indonesia" width={56} height={56} priority />

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#FFB432]">
            Planet Indonesia Management Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Masuk dengan akun YPI</h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Portal ini khusus untuk tim Yayasan Planet Indonesia. Gunakan email @planetindonesia.org.
          </p>

          {error ? (
            <p role="alert" className="mt-5 rounded-xl bg-[#730A2D] px-4 py-3 text-sm leading-6">
              {error === "AccessDenied"
                ? "Akun ini tidak bisa masuk. Pilih akun dengan email @planetindonesia.org."
                : "Login gagal. Coba lagi, atau hubungi tim MEL bila berulang."}
            </p>
          ) : null}

          <form action={masuk} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#004B5C] transition hover:bg-[#F7F0EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB432]"
            >
              Masuk dengan Google
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
