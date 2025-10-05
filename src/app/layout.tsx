import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION, APP_URL, APP_KEYWORDS } from "@/lib/constants";
import { StructuredData } from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - NASA-Powered Climate Forecast`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: `${APP_NAME} - NASA-Powered Climate Forecast`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    // images: [
    //   {
    //     url: '/og-image.png', // TODO: Add when logo is ready
    //     width: 1200,
    //     height: 630,
    //     alt: `${APP_NAME} - Climate Forecast Tool`,
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - NASA-Powered Climate Forecast`,
    description: APP_DESCRIPTION,
    creator: `@${APP_NAME.toLowerCase()}`, // Update with actual Twitter handle
    // images: ['/og-image.png'], // TODO: Add when logo is ready
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    // icon: '/favicon.ico', // TODO: Add when logo is ready
    // shortcut: '/favicon-16x16.png',
    // apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
