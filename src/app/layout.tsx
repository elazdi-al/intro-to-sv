import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dna, Calculator, TreePine, Home, Brain, Users, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DNA Analyzer - BIO105",
  description: "Outil d'analyse de séquences ADN pour BIO105",
};

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Outils ADN', href: '/dna-tools', icon: Dna },
  { name: 'UPGMA', href: '/upgma', icon: TreePine },
  { name: 'Probabilités', href: '/probabilities', icon: Calculator },
  { name: 'Angelman', href: '/angelman', icon: Brain },
  { name: 'Prader-Willi', href: '/prader-willi', icon: Users },
  { name: 'HUMARA', href: '/humara', icon: Microscope },
];

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
        <div className="min-h-screen bg-background">
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2">
                <Dna className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold">DNA Analyzer</span>
                <span className="text-sm text-gray-500">BIO105</span>
              </Link>
              
              <nav className="flex items-center space-x-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
