import type { Metadata } from "next";
import { Mansalva } from "next/font/google";
import "./globals.css";
import Footer from "@/src/components/Footer"; // <--- IMPORT FOOTER

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

        {/* THE CRAYON FRAME */}
        <div className="crayon-frame"></div>

        {/* MAIN CONTENT GROWS TO FILL SPACE */}
        <div className="flex-1">
          {children}
        </div>

        {/* FOOTER AT THE BOTTOM */}
        <Footer />

      </body>
    </html>
  );
}