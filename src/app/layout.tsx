import { Header } from "@/components/Header";
import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Posts Manager",
  description: "Manage your posts with CRUD operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F4F2EE]`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
