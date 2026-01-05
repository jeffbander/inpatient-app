import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inpatient App - Progress Notes",
  description: "Clinical progress notes management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
