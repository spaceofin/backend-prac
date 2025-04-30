import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Express Auth Practice",
  description: "Application for practicing authentication with Express",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
