import type { Metadata } from "next";
import FullscreenEmbed from "../../components/FullscreenEmbed";

export const metadata: Metadata = {
  title: "Peta Mitra Pesisir ORCA · Planet Indonesia",
};

// HTML statis mandiri (data zona, batas desa, mangrove, dan profil mitra tertanam) di public/monitoring/.
export default function PetaMitraPesisirPage() {
  return (
    <FullscreenEmbed
      src="/monitoring/peta-mitra-pesisir.html"
      title="Peta Mitra Pesisir ORCA Program 2027–2029"
    />
  );
}
