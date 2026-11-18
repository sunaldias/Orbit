import type { Metadata, Viewport } from "next";
import { Montserrat, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { SITE_CONFIG } from "@/data/navigation";
import { serializeJsonLd } from "@/lib/security";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F5F8F8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "ORBIT — Every Detail, Intended. | Event Creative & Visual Production",
    template: "%s | ORBIT",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "event videography",
    "event visual production",
    "motion flyers",
    "event branding",
    "creative direction",
    "event photography",
    "promotional videos",
    "motion graphics",
    "flyer design",
    "creative agency",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.legalName,
    title: "ORBIT — Every Detail, Intended.",
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "ORBIT — Every Detail, Intended.",
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.legalName,
  alternateName: SITE_CONFIG.name,
  slogan: "Every Detail, Intended.",
  url: SITE_CONFIG.url,
  email: SITE_CONFIG.email,
  description: SITE_CONFIG.description,
  sameAs: SITE_CONFIG.socials.map((s) => s.href),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen bg-[#F5F8F8] text-[#08242B] antialiased selection:bg-[#D6F80B] selection:text-[#072B33]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#074E5B] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
