import type { Metadata } from "next";
import FullscreenEmbed from "../../components/FullscreenEmbed";

export const metadata: Metadata = {
  title: "Smart Patrol · Planet Indonesia",
};

// Peta Smart Patrol adalah aplikasi statis (Leaflet + Supabase) di public/smart-patrol/.
// Dimuat lewat iframe dari origin yang sama supaya panel Kelola Data dan filter tetap jalan apa adanya.
export default function SmartPatrolPage() {
  return (
    <FullscreenEmbed
      src="/smart-patrol/index.html"
      title="Peta Smart Patrol Yayasan Planet Indonesia"
    />
  );
}
