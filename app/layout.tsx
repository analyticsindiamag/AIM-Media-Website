import type { Metadata } from "next";
import { Old_Standard_TT, Merriweather } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import MixpanelProvider from "./mixpanel-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parseDesignSystem, generateCSSVariables } from "@/lib/design-system";

// Display font for headings - Old Standard TT (serif)
const oldStandardTT = Old_Standard_TT({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Body font for text - Merriweather (serif per reference spec)
const merriweather = Merriweather({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
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

  // Parse design system from database
  const designSystem = parseDesignSystem(
    settings?.designSystemColorsJson,
    settings?.designSystemTypographyJson,
    settings?.designSystemSpacingJson,
    settings?.designSystemLayoutJson
  );

  // Generate CSS variables
  const cssVariables = generateCSSVariables(designSystem);

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
        {/* Dynamic CSS Variables from Design System */}
        <style dangerouslySetInnerHTML={{
          __html: `:root { ${cssVariables} }`,
        }} />
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
        className={`${oldStandardTT.variable} ${merriweather.variable} antialiased`}
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
