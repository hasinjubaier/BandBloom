import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ExamProvider } from "@/context/ExamContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BandBloom | Smart Computer-Delivered IELTS Preparation SaaS",
  description: "Targeted AI feedback, official IELTS band rounding, computer-delivered mock tests, and grounded RAG tutor for IELTS Academic and General Training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#123C3A] dark:text-[#F4FAF8] selection:bg-[#25A995] selection:text-white dark:selection:bg-[#25A995] dark:selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <ExamProvider>
              <AppShell>{children}</AppShell>
            </ExamProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
