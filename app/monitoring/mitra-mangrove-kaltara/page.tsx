import type { Metadata } from "next";
import FullscreenEmbed from "../../components/FullscreenEmbed";

export const metadata: Metadata = {
  title: "Mitra Mangrove Kaltara Program Weaverly · Planet Indonesia",
};

// HTML statis mandiri (batas desa, raster MVI 2025, dan luas per desa tertanam) di public/monitoring/.
export default function MitraMangroveKaltaraPage() {
  return (
    <FullscreenEmbed
      src="/monitoring/mitra-mangrove-kaltara.html"
      title="Mitra Mangrove Kaltara Program Weaverly"
    />
  );
}
