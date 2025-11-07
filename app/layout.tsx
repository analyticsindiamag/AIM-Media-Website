import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import MixpanelProvider from "./mixpanel-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  // Get site settings for schema
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  }).catch(() => null);
  
  const siteName = settings?.siteName || "AI Tech News";
  const logoUrl = settings?.logoUrl || `${baseUrl}/logo.png`;

  // Organization and Website Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 512,
      height: 512,
    },
    sameAs: [], // Can be populated with social media URLs
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/api/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${garamond.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AuthSessionProvider>
            <MixpanelProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </MixpanelProvider>
          </AuthSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
