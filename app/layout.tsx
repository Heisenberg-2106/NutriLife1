import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NutriLife - Nutrition Tracking App",
  description: "Track your nutrition, get personalized recommendations, and achieve your health goals with NutriLife.",
};


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark min-h-screen bg-background`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
        >
          <div className="flex">
            {/* Sidebar on the left */}
            <Sidebar />

            {/* Main Content on the right */}
            <main className="flex-1 p-4">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}