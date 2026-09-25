"use client";

import { FormEvent, useState } from "react";
import TopNav from "@/app/components/TopNav";

const RAILWAY_URL =
  "https://ypi-partnership-portal-production.up.railway.app/";

export default function PartnerReviewPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!password.trim()) {
      setError("Silakan masukkan kata sandi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/partner-review-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Password salah.");
        return;
      }

      // Password benar → buka portal Railway di tab baru
      window.open(
        RAILWAY_URL,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Partner Review Login:", error);
      setError("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      {/* Global PI Navigation */}
      <TopNav />

      {/* Password Gateway */}
      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-[28px] border border-[#004B5C]/10 bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
                Planet Indonesia
              </p>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#004B5C] md:text-3xl">
                Portal Reviu Kemitraan
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/60">
                Masukkan kata sandi untuk melanjutkan.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="partner-review-password"
                  className="mb-2 block text-sm font-semibold text-[#004B5C]"
                >
                  Kata sandi
                </label>

                <input
                  id="partner-review-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#004B5C]/15 bg-[#F7F0EC]/40 px-4 py-3 text-sm text-[#004B5C] outline-none transition focus:border-[#004B5C] focus:ring-2 focus:ring-[#004B5C]/10 disabled:opacity-60"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[#730A2D]/15 bg-[#730A2D]/5 px-4 py-3 text-sm font-medium text-[#730A2D]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#004B5C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#003D4A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memverifikasi..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
