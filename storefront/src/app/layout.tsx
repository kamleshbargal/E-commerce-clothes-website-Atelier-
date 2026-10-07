import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleHub | Considered everyday style",
  description: "Clothing and fashion for every kind of day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
