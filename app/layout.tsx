import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
  title: "Capital Physics",
  description: "A systematic macro framework for regime detection and capital allocation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="macro-framework-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
