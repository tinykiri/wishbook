import type { Metadata } from "next";
import { Mansalva } from "next/font/google";
import "./globals.css";
import Footer from "@/src/components/Footer";
import { ThemeProvider } from "@/src/contexts/ThemeContext";

const mansalva = Mansalva({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mansalva",
});

export const metadata: Metadata = {
  title: "My WishList",
  description: "A messy, hand-made wish list.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mansalva.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          {/* THE CRAYON FRAME */}
          <div className="crayon-frame"></div>

          {/* MAIN CONTENT*/}
          <div className="flex-1">
            {children}
          </div>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}