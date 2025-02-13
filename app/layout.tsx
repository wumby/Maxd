import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Maxd",
  description: "The everything app for fitness people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <header>
            <Header />
          </header>
          {children}
        </ThemeProvider>
        {children}
      </body>
    </html>
  );
}
