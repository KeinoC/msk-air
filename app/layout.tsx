import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";
import Providers from "./components/providers";

export const metadata: Metadata = {
  title: "MSK Air",
  description: "MSK Air Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-svh">
        <Providers>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

