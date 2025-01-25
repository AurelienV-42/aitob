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
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-xl">
              <h1 className="text-xl font-semibold">Aitob</h1>
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
