import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import Providers from "./providers";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Patients Elite CRM',
  description: 'Système de gestion des patients, diagnostics, ventes et locations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Providers>
          <AuthGuard>
            <ConditionalNavbar />
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
