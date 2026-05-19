import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import LayoutWrapper from "../components/layout-wrapper";

export const metadata: Metadata = {
  title: "Power Law",
  description: "A comprehensive framework for macro economic analysis and data visualization",
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
