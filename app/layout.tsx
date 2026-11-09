import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, LINKEDIN, GITHUB, asset } from "@/lib/site";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Chat } from "@/components/Chat";
import { Palette } from "@/components/Palette";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const TITLE = "Nakshatra Garg · AI Engineer for LLM Inference, Voice AI & RAG";
const DESCRIPTION =
  "AI engineer building production LLM inference, RAG and real-time voice AI that handles millions of calls a day: self-hosted vLLM on H200 GPUs, guardrails, ASR/TTS. Noida, India.";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: TITLE, template: "%s · Nakshatra Garg" },
  description: DESCRIPTION,
  authors: [{ name: "Nakshatra Garg", url: `${SITE_URL}/` }],
  creator: "Nakshatra Garg",
  alternates: { canonical: "./" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: { icon: asset("/favicon.svg"), apple: asset("/apple-touch-icon.png") },
  openGraph: {
    type: "profile",
    firstName: "Nakshatra",
    lastName: "Garg",
    siteName: "Nakshatra Garg",
    locale: "en_IN",
    title: "Nakshatra Garg · AI Engineer for LLM inference, voice AI and RAG",
    description: "I build LLM and voice AI systems that handle millions of calls a day: self-hosted LLMs, guardrails, hybrid RAG and real-time speech.",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "Nakshatra Garg, AI engineer: I build LLM and voice AI systems that handle millions of calls a day." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nakshatra Garg · AI Engineer for LLM inference, voice AI and RAG",
    description: "I build LLM and voice AI systems that handle millions of calls a day.",
    images: ["og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Nakshatra Garg", inLanguage: "en", publisher: { "@id": `${SITE_URL}/#person` } },
    { "@type": "ProfilePage", "@id": `${SITE_URL}/#profile`, url: `${SITE_URL}/`, name: TITLE, isPartOf: { "@id": `${SITE_URL}/#website` }, mainEntity: { "@id": `${SITE_URL}/#person` } },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Nakshatra Garg",
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/og.png`,
      jobTitle: "AI Engineer (Data Scientist / AI Associate)",
      description: "AI engineer building production LLM inference, retrieval-augmented generation (RAG) and real-time voice AI systems.",
      worksFor: { "@type": "Organization", name: "Rezo.ai", url: "https://rezo.ai" },
      address: { "@type": "PostalAddress", addressLocality: "Noida", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "Vellore Institute of Technology" },
        { "@type": "CollegeOrUniversity", name: "College of Engineering Roorkee" },
      ],
      knowsAbout: ["Large language models", "LLM inference", "vLLM", "GPU inference", "Retrieval-augmented generation", "Hybrid search", "Voice AI", "Speech recognition", "Spoken language identification", "Text-to-speech", "LoRA fine-tuning", "LLM evaluation", "Guardrails", "Python", "FastAPI"],
      knowsLanguage: ["English", "Hindi"],
      sameAs: [LINKEDIN, GITHUB],
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">Skip to content</a>
        <Providers>
          <ScrollProgress />
          <Nav />
          <main id="main">{children}</main>
          <Chat />
          <Palette />
        </Providers>
      </body>
    </html>
  );
}
