import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

// PI brand font (pi-brand-guardian): Instrument Sans for headings and body.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planet Indonesia Management Portal",
  description: "Scaling and Partnership Management Sprint PI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
