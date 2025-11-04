import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import MixpanelProvider from "./mixpanel-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "AI Tech News - Latest AI & Technology News",
    template: "%s | AI Tech News"
  },
  description: "Stay updated with the latest news and insights on Artificial Intelligence, Machine Learning, and emerging technologies.",
  keywords: ["AI", "Artificial Intelligence", "Machine Learning", "Technology News", "AI Startups", "Enterprise AI"],
  authors: [{ name: "AI Tech News" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "AI Tech News",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Tech News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tech News",
    description: "Latest AI & Technology News",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${garamond.variable} antialiased`}
      >
        <MixpanelProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </MixpanelProvider>
      </body>
    </html>
  );
}
