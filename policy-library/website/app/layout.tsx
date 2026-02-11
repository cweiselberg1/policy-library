import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MixpanelProvider } from "@/components/MixpanelProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HIPAA Policy Library | One Guy Consulting",
  description: "Production-ready HIPAA compliance policies for Covered Entities and Business Associates. 100% Security Rule coverage. 39 CE policies and 23 BA policies - ready to customize.",
  keywords: ["HIPAA", "compliance", "policies", "healthcare", "security", "privacy", "covered entity", "business associate"],
  authors: [{ name: "One Guy Consulting" }],
  openGraph: {
    title: "HIPAA Policy Library",
    description: "39 CE policies and 23 BA policies - ready to customize",
    type: "website",
    url: "https://hipaa-policy-library.oneGuyconsulting.com",
    siteName: "HIPAA Policy Library",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIPAA Policy Library",
    description: "Production-ready HIPAA compliance policies for healthcare organizations",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MixpanelProvider>
          {children}
        </MixpanelProvider>
      </body>
    </html>
  );
}
