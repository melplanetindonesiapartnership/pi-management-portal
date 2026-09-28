import TopNav from "@/app/components/TopNav";

type Partner = {
  name: string;
  domain: string;
  url: string;
  initials: string;
  thumbnail: string;
};

const partners: Partner[] = [
  {
    name: "Akar Global Inisiatif",
    domain: "akar.or.id",
    url: "https://akar.or.id/",
    initials: "AGI",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=akar.or.id&sz=256",
  },
  {
    name: "Fala Lamo",
    domain: "falalamo.org",
    url: "https://www.falalamo.org/",
    initials: "FL",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=falalamo.org&sz=256",
  },
  {
    name: "Perkumpulan Japesda",
    domain: "japesda.or.id",
    url: "https://japesda.or.id/",
    initials: "JPD",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=japesda.or.id&sz=256",
  },
  {
    name: "Yayasan Pionir Bulungan",
    domain: "pionir.or.id",
    url: "https://pionir.or.id/",
    initials: "YPB",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=pionir.or.id&sz=256",
  },
  {
    name: "Tananua Flores",
    domain: "tananua.org",
    url: "https://www.tananua.org/",
    initials: "TF",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=tananua.org&sz=256",
  },
  {
    name: "Perkumpulan Konservasi Kakatua Indonesia",
    domain: "konservasi-kakatua-indonesia.org",
    url: "https://konservasi-kakatua-indonesia.org/en/",
    initials: "KKI",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=konservasi-kakatua-indonesia.org&sz=256",
  },
  {
    name: "Toli Toli Labengki Giant Clam Conservation",
    domain: "tlgconservation.org",
    url: "https://tlgconservation.org/",
    initials: "TLGC",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=tlgconservation.org&sz=256",
  },
  {
    name: "Yayasan Citra Mandiri Mentawai",
    domain: "ycmmentawai.org",
    url: "https://www.ycmmentawai.org/",
    initials: "YCMM",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=ycmmentawai.org&sz=256",
  },
  {
    name: "Yayasan Juang Laut Lestari",
    domain: "yayasanjuanglautlestari.org",
    url: "https://www.yayasanjuanglautlestari.org/",
    initials: "JARI",
    thumbnail:
      "https://www.google.com/s2/favicons?domain=yayasanjuanglautlestari.org&sz=256",
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#730A2D]">
            Partnership Network
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Partners
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60 md:text-base">
            Explore the websites and public presence of Planet Indonesia
            partner organizations.
          </p>
        </section>

        {/* Partner count */}
        <section className="mt-6">
          <p className="text-sm text-black/50">
            <span className="font-semibold text-[#004B5C]">
              {partners.length}
            </span>{" "}
            partner websites
          </p>
        </section>

        {/* Partner grid */}
        <section className="mt-8 pb-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <a
                key={partner.url}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#004B5C]/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#004B5C]/5 via-white to-[#FFB432]/10" />

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm">
                    <img
                      src={partner.thumbnail}
                      alt={`${partner.name} website`}
                      className="h-14 w-14 object-contain"
                      loading="lazy"
                    />
                  </div>

                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#004B5C] shadow-sm">
                    Partner
                  </span>

                  <span className="absolute bottom-4 right-4 rounded-full bg-[#004B5C] px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Visit website ↗
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-6 text-[#004B5C]">
                        {partner.name}
                      </h2>

                      <p className="mt-2 text-sm text-black/45">
                        {partner.domain}
                      </p>
                    </div>

                    <span className="shrink-0 text-lg text-[#004B5C]/35 transition group-hover:text-[#004B5C]">
                      ↗
                    </span>
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex rounded-full bg-[#004B5C]/6 px-3 py-1 text-[11px] font-semibold text-[#004B5C]/70">
                      Official website
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}