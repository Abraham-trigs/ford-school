// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: ".Astir",
  description: "Astir School Management System",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-primary text-lightGray font-sans min-h-screen">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
          <footer className="text-center text-sm text-accentTeal py-4">
            &copy; {new Date().getFullYear()} Astir. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
