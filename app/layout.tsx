// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Roboto, Poppins } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"], // headings
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Monday Deals Starter",
  description: "Next.js + TypeScript + Tailwind + shadcn/ui starter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen bg-[var(--app-bg)] text-gray-900 dark:text-neutral-100 antialiased font-roboto">
        {children}
      </body>
    </html>
  );
}
