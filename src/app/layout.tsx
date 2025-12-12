import type { Metadata } from "next";
import { Covered_By_Your_Grace } from "next/font/google";
import "./globals.css";

const uglyFont = Covered_By_Your_Grace({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ugly",
});

export const metadata: Metadata = {
  title: "My WishList ✂️",
  description: "A messy, hand-made wish list.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${uglyFont.variable} antialiased`}>

        {/* THIS IS THE BORDER FRAME */}
        <div className="crayon-frame"></div>

        {children}
      </body>
    </html>
  );
}