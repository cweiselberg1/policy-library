import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MixpanelProvider } from "@/components/MixpanelProvider";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HIPAA Compliance Portal | One Guy Consulting",
  description: "HIPAA compliance portal for healthcare organizations. Manage policies, audits, risk assessments, incidents, and remediation plans.",
  keywords: ["HIPAA", "compliance", "portal", "healthcare", "security", "privacy", "audit", "risk assessment"],
  authors: [{ name: "One Guy Consulting" }],
  openGraph: {
    title: "HIPAA Compliance Portal",
    description: "Manage HIPAA compliance — policies, audits, risk assessments, and more",
    type: "website",
    url: "https://portal.oneguyconsulting.com",
    siteName: "HIPAA Compliance Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIPAA Compliance Portal",
    description: "HIPAA compliance portal for healthcare organizations",
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
        className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <MixpanelProvider>
          {children}
        </MixpanelProvider>
      </body>
    </html>
  );
}
