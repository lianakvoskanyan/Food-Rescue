import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Food Rescue Marketplace",
    template: "%s · Food Rescue Marketplace",
  },
  description:
    "A platform where bakeries, cafés, and shops sell surplus food at a discount and cut food waste.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="site-shell flex min-h-full flex-col">
        <div className="site-main-glow" aria-hidden />
        {children}
      </body>
    </html>
  );
}
