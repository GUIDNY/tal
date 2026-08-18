import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "טל ראופמן | DJ ונגן סקסופון לחתונות ואירועים",
    template: "%s | טל ראופמן",
  },
  description:
    "טל ראופמן — DJ ונגן סקסופון עם מעל 20 שנות ניסיון. הופעות לחתונות, אירועים עסקיים, אירועים פרטיים, פסטיבלים ומועדונים בארץ ובעולם.",
  keywords: [
    "נגן סקסופון לחתונה",
    "סקסופוניסט לחתונה",
    "DJ לחתונה",
    "DJ וסקסופון לחתונה",
    "נגן סקסופון לאירועים",
    "DJ לאירועים",
    "סקסופון לייב",
    "Tal Raufman",
    "טל ראופמן",
  ],
  openGraph: {
    title: "טל ראופמן | DJ ונגן סקסופון",
    description: "DJ וסקסופון לייב לחתונות, אירועים ופסטיבלים בארץ ובעולם.",
    url: siteConfig.url,
    siteName: "טל ראופמן",
    locale: siteConfig.locale,
    type: "website",
    images: [{ url: "/tal/portraits/street-joy-arms-out-sax.jpg", width: 1599, height: 2400 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "טל ראופמן | DJ ונגן סקסופון",
    description: "DJ וסקסופון לייב לחתונות, אירועים ופסטיבלים בארץ ובעולם.",
    images: ["/tal/portraits/street-joy-arms-out-sax.jpg"],
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tal Raufman",
  alternateName: "טל ראופמן",
  jobTitle: "DJ & Saxophone Artist",
  url: siteConfig.url,
  image: `${siteConfig.url}/tal/portraits/street-joy-arms-out-sax.jpg`,
  sameAs: [siteConfig.social.instagram].filter(Boolean),
  description:
    "DJ ונגן סקסופון עם מעל 20 שנות ניסיון על הבמה, המופיע בחתונות, אירועים עסקיים, אירועים פרטיים, פסטיבלים ומועדונים בארץ ובעולם.",
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "DJ & Live Saxophone Performance",
  provider: { "@type": "Person", name: "Tal Raufman" },
  areaServed: "IL",
  description: "הופעות DJ וסקסופון לייב לחתונות, אירועים עסקיים, אירועים פרטיים, פסטיבלים ומועדונים.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
