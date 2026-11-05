import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Mom's Traditional Tailor Shop & AI 3D Fitting Studio (ApsaraFit)",
  description: "Bespoke traditional Khmer silk couture powered by 3D browser anthropometry and millimeter-precision tailoring ease.",
  keywords: ["Khmer Tailor", "Av Pak", "Sampot Hol", "3D Body Scanner", "Bespoke Silk", "Cambodia Tailor Shop"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
